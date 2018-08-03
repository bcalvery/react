import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as _ from 'lodash'

import {
  AutoControlledComponent,
  childrenExist,
  createHTMLInput,
  customPropTypes,
  getUnhandledProps,
  partitionHTMLProps,
  UIComponent,
} from '../../lib'
import inputRules from './inputRules'
import inputVariables from './inputVariables'
import Icon from '../Icon'
import callable from '../../lib/callable'

/**
 * An Input
 * @accessibility This is example usage of the accessibility tag.
 */
class Input extends AutoControlledComponent<any, any> {
  static className = 'ui-input'

  static displayName = 'Input'

  static rules = inputRules
  static variables = inputVariables

  static propTypes = {
    /** An element type to render as (string or function). */
    as: customPropTypes.as,

    /** Primary content. */
    children: PropTypes.node,

    /** Additional classes. */
    className: PropTypes.string,

    /** A property that will change the icon on the input and clear the input on click on Cancel */
    clearable: PropTypes.bool,

    /** The default value of the input string. */
    defaultValue: PropTypes.string,

    /** Optional Icon to display inside the Input. */
    icon: customPropTypes.itemShorthand,

    /** Shorthand for creating the HTML Input. */
    input: customPropTypes.itemShorthand,

    /**
     * Called on change.
     *
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {object} data - All props and proposed value.
     */
    onChange: PropTypes.func,

    /** The HTML input type. */
    type: PropTypes.string,

    /** The value of the input. */
    value: PropTypes.string,
  }

  static handledProps = [
    'as',
    'children',
    'className',
    'clearable',
    'defaultValue',
    'icon',
    'input',
    'onChange',
    'type',
    'value',
  ]

  static defaultProps = {
    as: 'div',
    type: 'text',
  }

  inputRef: any

  static autoControlledProps = ['value']

  computeTabIndex = props => {
    if (!_.isNil(props.tabIndex)) return props.tabIndex
    if (props.onClick) return 0
  }

  handleChange = e => {
    const value = _.get(e, 'target.value')
    const { clearable } = this.props

    _.invoke(this.props, 'onChange', e, { ...this.props, value })

    this.trySetState({ value })
  }

  handleChildOverrides = (child, defaultProps) => ({
    ...defaultProps,
    ...child.props,
  })

  handleInputRef = c => (this.inputRef = c)

  handleOnClear = e => {
    const { clearable, icon } = this.props
    const { value } = this.state

    if (clearable && value.length !== 0) {
      this.trySetState({ value: '' })
    }
  }

  partitionProps = () => {
    const { type } = this.props
    const { value } = this.state

    const unhandled = getUnhandledProps(Input, this.props)
    const [htmlInputProps, rest] = partitionHTMLProps(unhandled)

    return [
      {
        ...htmlInputProps,
        onChange: this.handleChange,
        type,
        value,
      },
      rest,
    ]
  }

  computeIcon = () => {
    const { clearable, icon } = this.props
    const { value } = this.state

    if (clearable && !_.isNil(icon) && value.length !== 0) {
      return 'close'
    }

    if (!_.isNil(icon)) return icon

    return null
  }

  handleIconOverrides = predefinedProps => {
    return {
      onClick: e => {
        this.handleOnClear(e)

        this.inputRef.focus()
        _.invoke(predefinedProps, 'onClick', e, this.props)
      },
      tabIndex: this.computeTabIndex,
    }
  }

  renderComponent({ ElementType, classes, rest }) {
    const { children, className, clearable, icon, input, type } = this.props
    const [htmlInputProps, restProps] = this.partitionProps()

    const inputClasses = classes.input
    const iconClasses = classes.icon

    // Render with children
    // ----------------------------------------
    if (childrenExist(children)) {
      // add htmlInputProps to the `<input />` child
      const childElements = _.map(React.Children.toArray(children), child => {
        if (child.type !== 'input') return child
        return React.cloneElement(child, this.handleChildOverrides(child, htmlInputProps))
      })

      return (
        <ElementType {...rest} className={classes.root}>
          {childElements}
        </ElementType>
      )
    }

    return (
      <ElementType {...rest} className={classes.root} {...htmlInputProps}>
        {createHTMLInput(input || type, {
          defaultProps: htmlInputProps,
          overrideProps: {
            className: inputClasses,
            ref: this.handleInputRef,
          },
        })}
        {this.computeIcon() &&
          Icon.create(this.computeIcon(), {
            defaultProps: { className: iconClasses },
            overrideProps: this.handleIconOverrides,
          })}
      </ElementType>
    )
  }
}

export default Input
