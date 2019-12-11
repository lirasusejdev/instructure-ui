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
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import { View } from '@instructure/ui-view'
import { themeable, ThemeablePropTypes } from '@instructure/ui-themeable'
import { childrenOrValue } from '@instructure/ui-prop-types'
import { deprecated, getElementType, omitProps } from '@instructure/ui-react-utils'
import { testable } from '@instructure/ui-testable'

import styles from './styles.css'
import theme from './theme'

/**
---
category: components/deprecated
id: DeprecatedHeading
---
**/

@deprecated('7.0.0', null, 'Use Heading from ui-heading instead.')
@testable()
@themeable(theme, styles)
class Heading extends Component {
   static propTypes = {
     border: PropTypes.oneOf(['none', 'top', 'bottom']),
     children: childrenOrValue,
     color: PropTypes.oneOf([
      'primary',
      'secondary',
      'primary-inverse',
      'secondary-inverse',
      'inherit'
    ]),
     level: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'reset']),
    /**
    * the element type to render as (defaults to the level)
    */
     as: PropTypes.elementType, // eslint-disable-line react/require-default-props
     ellipsis: PropTypes.bool,
    /**
    * Valid values are `0`, `none`, `auto`, `xxx-small`, `xx-small`, `x-small`,
    * `small`, `medium`, `large`, `x-large`, `xx-large`. Apply these values via
    * familiar CSS-like shorthand. For example: `margin="small auto large"`.
    */
     margin: ThemeablePropTypes.spacing,
     elementRef: PropTypes.func
   }

   static defaultProps = {
     children: null,
     margin: undefined,
     elementRef: undefined,
     border: 'none',
     color: 'inherit',
     level: 'h2',
     ellipsis: false
   }

   render () {
     const {
      border,
      children,
      color,
      level,
      ellipsis,
      margin,
      elementRef
    } = this.props

    const ElementType = getElementType(Heading, this.props, () => {
      if (level === 'reset') {
       return 'span'
      } else {
       return level
      }
    })

    const passthroughProps = View.omitViewProps(
      omitProps(this.props, Heading.propTypes),
      Heading
    )

    return (
      <View
       {...passthroughProps}
       className={classnames({
         [styles.root]: true,
         [styles[level]]: true,
         [styles[`color-${color}`]]: color,
         [styles[`border-${border}`]]: border !== 'none',
         [styles.ellipsis]: ellipsis
       })}
       as={ElementType}
       margin={margin}
       elementRef={elementRef}
      >
       {children}
      </View>
    )
  }
}

export default Heading
export { Heading }
