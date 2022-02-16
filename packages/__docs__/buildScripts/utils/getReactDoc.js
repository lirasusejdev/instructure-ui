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
const apiExtractor = require('@microsoft/api-extractor')
const myApiModel = require('@microsoft/api-extractor-model')
const reactDocgen = require('react-docgen')

const path = require('path')
const { ApiClass } = require('@microsoft/api-extractor-model')

const ERROR_MISSING_DEFINITION = 'No suitable component definition found.'

module.exports = function getReactDoc(source, fileName, error) {
  // invoke api extractor
  const apiExtractorJsonPath = path.join(
    fileName,
    '../../../api-extractor.json'
  )
  const extractorConfig =
    apiExtractor.ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)
  const extractorResult = apiExtractor.Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true
  })
  if (extractorResult.succeeded) {
    // console.log(`API Extractor completed successfully`)
    process.exitCode = 0
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    )
    process.exitCode = 1
  }
  // process api.json file
  const apiModel = new myApiModel.ApiModel()
  const packagePath = path.join(fileName, '../../../')
  const packageName = path.basename(packagePath)
  const apiPackage = apiModel.loadPackage(
    '../../packages/ui-avatar/temp/ui-avatar.api.json'
  )
  let doc = {}
  apiPackage.members.forEach((element) => {
    let members = element.members
    for (const member of members) {
      if (member.kind === 'Class') {
        for (const classMember of member.members) {
          const asd = classMember.buildCanonicalReference()
          const obj = {}
          classMember.serializeInto(obj)
          // eslint-disable-next-line no-console
          console.log(obj)
          // TODO put stuff into obj, like obj[classMember.displayName] = ??
        }
      }
    }
    // console.log(JSON.stringify(element))
  })

  /*
  try {
    doc = reactDocgen.parse(
      source,
      reactDocgen.resolver.findAllExportedComponentDefinitions,
      null,
      {
        filename: fileName,
        importer: reactDocgen.importers.makeFsImporter()
      }
    )
    if (Array.isArray(doc)) {
      if (doc.length > 1) {
        // If a file has multiple exports this will choose the one that has the
        // same name in its path.
        for (const docExport of doc) {
          const filePathArray = fileName.split(path.sep)
          if (filePathArray.includes(docExport.displayName)) {
            doc = docExport
            break
          }
        }
      } else {
        doc = doc.pop()
      }
    }
  } catch (err) {
    if (err.message !== ERROR_MISSING_DEFINITION) {
      error(err)
    }
  }
   */
  return doc
}
