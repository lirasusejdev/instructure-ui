/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { getPackageJSON, getPackages } from '@instructure/pkg-utils'
import {
  error,
  info,
  runCommandSync,
  runCommandAsync
} from '@instructure/command-utils'

import { getConfig } from './utils/config'
import {
  checkWorkingDirectory,
  isReleaseCommit,
  setupGit,
  resetToCommit
} from './utils/git'
import { createNPMRCFile, bumpPackages } from './utils/npm'

try {
  const pkgJSON = getPackageJSON(undefined)
  // ui-scripts --publish               - to publish from the master branch
  // ui-scripts --publish maintenance   - to publish from any legacy branch
  const isMaintenance = process.argv[3] === 'maintenance'

  publish({
    packageName: pkgJSON.name,
    version: pkgJSON.version,
    isMaintenance,
    //TODO investigate if config is needed
    config: getConfig(pkgJSON)
  })
} catch (err) {
  error(err)
  process.exit(1)
}

async function publish({
  packageName,
  version,
  isMaintenance,
  config = {}
}: {
  packageName: string
  version: string
  isMaintenance: boolean
  config: any
}) {
  const isRelease = isReleaseCommit(version)

  setupGit()
  createNPMRCFile(config)

  checkWorkingDirectory()
  // Npm-cli figures out versions from the package.json so if we'd like to
  // release a snapshot version, like: 8.3.5-snapshot.19, we'd need to set this exact version
  // to package.json and set it back to the current released version after the release.
  if (isRelease) {
    // If on legacy branch, and it is a release, its tag should say vx_maintenance
    const tag = isMaintenance
      ? `v${version.split('.')[0]}_maintenance`
      : 'latest'
    info(`📦  Version: ${version}, Tag: ${tag}`)
    await releaseAllPackagesToNpm(tag, version)
  } else {
    try {
      info(`📦 SNAPSHOT release. Version: ${version}, Tag: snapshot`)
      // bump package versions to x.y.[z+1]-snapshot.[#of commits since last tag]
      await bumpPackages(packageName, true)
      // call npm publish on every package
      const pkgJSON = getPackageJSON(undefined)
      await releaseAllPackagesToNpm('snapshot', pkgJSON.version)
      // reset all changes with Git
      resetToCommit()
    } catch (e) {
      error(e)
      process.exit(1)
    }
  }
}

function releaseAllPackagesToNpm(tag: string, version: string) {
  return Promise.all(
    getPackages().map(async (pkg: any) => {
      if (pkg.private) {
        info(`${pkg.name} is private.`)
      } else {
        let packageInfo: { versions: string[] } = { versions: [] }
        try {
          const { stdout } = runCommandSync(
            'npm',
            ['info', pkg.name, '--json'],
            [],
            { stdio: 'pipe' }
          )
          packageInfo = JSON.parse(stdout)
        } catch (e) {
          error(e)
        }
        if (packageInfo.versions.includes(version)) {
          info(`📦  v${version} of ${pkg.name} is already published!`)
        } else {
          try {
            await runCommandAsync('npm', [
              'publish',
              pkg.location,
              '--tag',
              tag
            ])
            info(`📦  Version ${version} was successfully published!`)
          } catch (err) {
            error(err)
          }
        }
      }
    })
  )
}
