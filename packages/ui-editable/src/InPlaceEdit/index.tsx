/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 - present Instructure, Inc.
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

/** @jsx jsx */
import { Component } from 'react'

import { Flex } from '@instructure/ui-flex'
import { IconButton } from '@instructure/ui-buttons'
import { IconEditLine } from '@instructure/ui-icons'
import { logWarn as warn } from '@instructure/console'
import { createChainedFunction } from '@instructure/ui-utils'
import { withStyle, jsx } from '@instructure/emotion'
import { View } from '@instructure/ui-view'

import { Editable } from '../Editable'
import generateStyle from './styles'

import { propTypes, allowedProps } from './props'
import type { InPlaceEditProps } from './props'

/**
---
category: components
---
**/
@withStyle(generateStyle, null)
class InPlaceEdit extends Component<InPlaceEditProps> {
  static readonly componentId = 'InPlaceEdit'
  static propTypes = propTypes
  static allowedProps = allowedProps
  static defaultProps = {
    readOnly: false,
    showFocusRing: true,
    inline: true,
    editButtonPlacement: 'end'
  }

  ref: Element | null = null

  handleRef = (el: Element | null) => {
    this.ref = el
  }

  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'props' implicitly has an 'any' type.
  constructor(props) {
    super(props)

    warn(
      props.readOnly ? props.mode === 'view' : true,
      '[InPlaceEdit] When readOnly is true, mode is forced to "view"'
    )
  }

  componentDidMount() {
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    this.props.makeStyles()
  }

  // @ts-expect-error ts-migrate(6133) FIXME: 'prevProps' is declared but its value is never rea... Remove this comment to see the full error message
  componentDidUpdate(prevProps, prevState, snapshot) {
    // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
    this.props.makeStyles()
  }

  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'el' implicitly has an 'any' type.
  handleEditButtonRef = (el) => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property '_editButtonRef' does not exist on type '... Remove this comment to see the full error message
    this._editButtonRef = el
  }

  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'mode' implicitly has an 'any' typ... Remove this comment to see the full error message
  renderEditor({ mode, onBlur, editorRef, readOnly }) {
    const { showFocusRing, renderEditor } = this.props
    const isEditMode = !readOnly && mode === 'edit'

    return isEditMode ? (
      <View
        as="span"
        display="block"
        withFocusOutline={showFocusRing}
        position="relative"
        css={this.props.styles?.inPlaceEdit}
        borderRadius="medium"
        margin="auto"
      >
        {renderEditor({ onBlur, editorRef })}
      </View>
    ) : null
  }

  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'readOnly' implicitly has an 'any'... Remove this comment to see the full error message
  renderViewer({ readOnly, mode }) {
    return readOnly || mode === 'view' ? this.props.renderViewer() : null
  }

  // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'buttonRef' implicitly has an 'any... Remove this comment to see the full error message
  renderEditButton({ buttonRef, ...rest }) {
    return this.props.renderEditButton({
      elementRef: createChainedFunction(this.handleEditButtonRef, buttonRef),
      ...rest
    })
  }

  // Render a default edit button, an icon button with the edit icon
  // the margin makes room for the focus ring
  static renderDefaultEditButton = ({
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'isVisible' implicitly has an 'any... Remove this comment to see the full error message
    isVisible,
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'readOnly' implicitly has an 'any'... Remove this comment to see the full error message
    readOnly,
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'label' implicitly has an 'any' ty... Remove this comment to see the full error message
    label,
    ...buttonProps
  }) => {
    if (readOnly) {
      return null
    }
    return (
      <IconButton
        size="small"
        screenReaderLabel={label}
        withBackground={false}
        withBorder={false}
        {...buttonProps}
      >
        {isVisible ? IconEditLine : null}
      </IconButton>
    )
  }

  renderAll = ({
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'getContainerProps' implicitly has... Remove this comment to see the full error message
    getContainerProps,
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'getViewerProps' implicitly has an... Remove this comment to see the full error message
    getViewerProps,
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'getEditorProps' implicitly has an... Remove this comment to see the full error message
    getEditorProps,
    // @ts-expect-error ts-migrate(7031) FIXME: Binding element 'getEditButtonProps' implicitly ha... Remove this comment to see the full error message
    getEditButtonProps
  }) => {
    const flexDir =
      this.props.editButtonPlacement === 'start' ? 'row-reverse' : 'row'
    const justifyItems = flexDir === 'row-reverse' ? 'end' : 'start'
    const buttonMargin =
      this.props.editButtonPlacement === 'start'
        ? '0 xx-small 0 0'
        : '0 0 0 xx-small'
    return (
      <Flex
        display={this.props.inline ? 'inline-flex' : 'flex'}
        direction={flexDir}
        justifyItems={justifyItems}
        {...getContainerProps()}
      >
        <Flex.Item shouldGrow shouldShrink>
          {this.renderEditor(getEditorProps())}
          {this.renderViewer(getViewerProps())}
        </Flex.Item>
        <Flex.Item margin={buttonMargin}>
          {this.renderEditButton(getEditButtonProps())}
        </Flex.Item>
      </Flex>
    )
  }

  render() {
    const { mode, value, onChange, onChangeMode, readOnly } = this.props

    return (
      <Editable
        mode={mode}
        onChangeMode={onChangeMode}
        render={this.renderAll}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        elementRef={this.handleRef}
      />
    )
  }
}

export default InPlaceEdit
export { InPlaceEdit }
