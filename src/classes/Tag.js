import EventEmitter from '../util/event-emitter'
import TypeErrorMessage from '../util/type-error-message'
import * as Utilities from '../util/utilities'

class Tag extends EventEmitter {
  /**
   * Create a new Tag instance
   * @param {{ x: Number, y: Number }} position - The tag’s coordinates
   * @param {String|Function} text - The tag’s content
   * @param {Object} [buttonAttributes = {}] - The button’s attributes
   * @param {Object} [popupAttributes = {}] - The popup’s attributes
   */
  constructor(position, text, buttonAttributes = {}, popupAttributes = {}) {
    if (!Utilities.isObject(position) || Array.isArray(position)) {
      throw new TypeError(TypeErrorMessage.getObjectMessage(position))
    } else if (!('x' in position) || !('y' in position)) {
      throw new Error(`${position} should have x and y property`)
    }

    super()

    this.wrapperElement = document.createElement('div')
    this.wrapperElement.classList.add('taggd__wrapper')

    this.buttonElement = document.createElement('button')
    this.buttonElement.classList.add('taggd__button')

    this.popupElement = document.createElement('span')
    this.popupElement.classList.add('taggd__popup')

    this.wrapperElement.appendChild(this.buttonElement)
    this.wrapperElement.appendChild(this.popupElement)

    this.text = undefined
    this.isControlsEnabled = false

    this.setButtonAttributes(buttonAttributes)
    this.setPopupAttributes(popupAttributes)
    this.setPosition(position.x, position.y)
    this.setText(text)

    this.hide()
  }

  /**
   * Subscribe to an event.
   * @param {String} eventName - The event to subscribe to.
   * @param {Function} handler - The handler to execute.
   * @return {Taggd} Current Taggd instance
   */
  on(eventName, handler) {
    return super.on(eventName, handler)
  }

  /**
   * Unsubscribe from an event.
   * @param {String} eventName - The event to unsubscribe from.
   * @param {Function} handler - The handler that was used to subscribe.
   * @return {Taggd} Current Taggd instance
   */
  off(eventName, handler) {
    return super.off(eventName, handler)
  }

  /**
   * Subscribe to an event and unsubscribe once triggered.
   * @param {String} eventName - The event to subscribe to.
   * @param {Function} handler - The handler to execute.
   * @return {Taggd} Current Taggd instance
   */
  once(eventName, handler) {
    return super.once(eventName, handler)
  }

  /**
   * Test whether the tag is hidden or not
   * @return {Boolean} A boolean indicating the tag’s state
   */
  isHidden() {
    return this.popupElement.style.display === 'none'
  }

  /**
   * Show the tag
   * @return {Taggd.Tag} Current Tag
   */
  show() {
    const isCanceled = !this.emit('taggd.tag.show', this)

    if (!isCanceled) {
      this.popupElement.style.display = ''
      this.emit('taggd.tag.shown', this)
    }

    return this
  }

  /**
   * Hide the tag
   * @return {Taggd.Tag} Current Tag
   */
  hide() {
    const isCanceled = !this.emit('taggd.tag.hide', this)

    if (!isCanceled) {
      this.popupElement.style.display = 'none'
      this.emit('taggd.tag.hidden', this)
    }

    return this
  }

  /**
   * Set the tag’s text
   * @param {String|Function} text - The tag’s content
   * @return {Taggd.Tag} Current Tag
   */
  setText(text) {
    if (!Utilities.isString(text) && !Utilities.isFunction(text)) {
      throw new TypeError(TypeErrorMessage.getMessage(text, 'a string or a function'))
    }

    const isCanceled = !this.emit('taggd.tag.change', this)

    if (!isCanceled) {
      if (Utilities.isFunction(text)) {
        this.text = text(this)
      } else {
        this.text = text
      }

      if (!this.isControlsEnabled) {
        this.popupElement.innerHTML = this.text
      } else {
        this.popupElement.innerHTML = this.text
      }

      this.emit('taggd.tag.changed', this)
    }

    return this
  }

  /**
   * Set the tag’s position
   * @param {Number} x - The tag’s x-coordinate
   * @param {Number} y - The tag’s y-coordinate
   * @return {Taggd.Tag} Current Tag
   */
  setPosition(x, y) {
    if (!Utilities.isNumber(x)) {
      throw new TypeError(TypeErrorMessage.getFloatMessage(x))
    }
    if (!Utilities.isNumber(y)) {
      throw new TypeError(TypeErrorMessage.getFloatMessage(y))
    }

    const isCanceled = !this.emit('taggd.tag.change', this)

    if (!isCanceled) {
      const positionStyle = Tag.getPositionStyle(x, y)

      this.wrapperElement.style.left = positionStyle.left
      this.wrapperElement.style.top = positionStyle.top

      this.emit('taggd.tag.changed', this)
    }

    return this
  }

  /**
   * Set the tag button’s attributes
   * @param {Object} atttributes = {} - The attributes to set
   * @return {Taggd.Tag} Current tag
   */
  setButtonAttributes(attributes = {}) {
    if (!Utilities.isObject(attributes) || Array.isArray(attributes)) {
      throw new TypeError(TypeErrorMessage.getObjectMessage(attributes))
    }

    const isCanceled = !this.emit('taggd.tag.change', this)

    if (!isCanceled) {
      Tag.setElementAttributes(this.buttonElement, attributes)
      this.emit('taggd.tag.changed', this)
    }

    return this
  }

  /**
   * Set the tag popup’s attributes
   * @param {Object} atttributes = {} - The attributes to set
   * @return {Taggd.Tag} Current tag
   */
  setPopupAttributes(attributes = {}) {
    if (!Utilities.isObject(attributes) || Array.isArray(attributes)) {
      throw new TypeError(TypeErrorMessage.getObjectMessage(attributes))
    }

    const isCanceled = !this.emit('taggd.tag.change', this)

    if (!isCanceled) {
      Tag.setElementAttributes(this.popupElement, attributes)
      this.emit('taggd.tag.changed', this)
    }

    return this
  }

  /**
   * Enables the tag controls
   * @return {Taggd.Tag} Current tag
   */
  enableControls() {
    this.isControlsEnabled = true
    this.setText(this.text)
    return this
  }

  /**
   * Disabled the tag controls
   * @return {Taggd.Tag} Current tag
   */
  disableControls() {
    this.isControlsEnabled = false
    this.setText(this.text)
    return this
  }

  /**
   * Get a Taggd.createFromObject-compatible object
   * @return {Object} A object for JSON
   */
  toJSON() {
    function getAttributes(rawAttributes) {
      const attributes = {}

      Array.prototype.forEach.call(rawAttributes, (attribute) => {
        if (attribute.name === 'class' || attribute.name === 'style') {
          return
        }

        attributes[attribute.name] = attribute.value
      })

      return attributes
    }

    return {
      position: {
        x: parseFloat(this.wrapperElement.style.left) / 100,
        y: parseFloat(this.wrapperElement.style.top) / 100,
      },
      text: this.text,
      buttonAttributes: getAttributes(this.buttonElement.attributes),
      popupAttributes: getAttributes(this.popupElement.attributes),
    }
  }

  /**
   * Set element attributes
   * @param {DomNode} element - The element the attributes should be set to
   * @param {Object} [attributes = {}] - A map of attributes to set
   * @return {DomNode} The original element
   */
  static setElementAttributes(element, attributes = {}) {
    if (!Utilities.isObject(attributes) || Array.isArray(attributes)) {
      throw new TypeError(TypeErrorMessage.getObjectMessage(attributes))
    }

    Object.entries(attributes).forEach((attribute) => {
      const [attributeName, attributeValue] = attribute

      if (attributeName === 'class' && element.getAttribute(attributeName)) {
        const classValue = `${element.getAttribute(attributeName)} ${attributeValue}`
        element.setAttribute(attributeName, classValue)
        return
      }

      element.setAttribute(attributeName, attributeValue)
    })

    return element
  }

  /**
   * Get the position style
   * @param {Number} x - The tag’s x-coordinate
   * @param {Number} y - The tag’s y-coordinate
   * @return {Object} The style
   */
  static getPositionStyle(x, y) {
    if (!Utilities.isNumber(x)) {
      throw new TypeError(TypeErrorMessage.getFloatMessage(x))
    }
    if (!Utilities.isNumber(y)) {
      throw new TypeError(TypeErrorMessage.getFloatMessage(y))
    }

    return {
      left: `${x * 100}%`,
      top: `${y * 100}%`,
    }
  }

  /**
   * Create a tag from object
   * @param {Object} object - The object containing all information
   * @return {Tag} The created Tag instance
   */
  static createFromObject(object) {
    return new Tag(object.position, object.text, object.buttonAttributes, object.popupAttributes)
  }
}

export default Tag