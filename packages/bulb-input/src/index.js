import keyboardKeys from './keyboard/keys'
import keyboardState from './keyboard/state'
import mouseButtons from './mouse/buttons'
import mousePosition from './mouse/position'
import mouseState from './mouse/state'

/**
 * This module provides functions to create signals that wrap the keyboard
 * input device.
 */
export const Keyboard = {
  /**
   * Creates a signal that emits a value if a key is pressed on the `target` DOM
   * element.
   *
   * If a key is held down continuously, then the signal will repeatedly emit
   * values at a rate determined by your OS key repeat setting.
   *
   * @param {EventTarget} target The event target (e.g. a DOM element).
   * @param {Object} [options] The options.
   * @param {Booelan} [options.preventDefault=false] A boolean indicating whether
   * the default action should be taken for the event.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Keyboard } from 'bulb-input'
   *
   * const s = Keyboard.keys(document)
   *
   * s.subscribe(console.log) // 1, 2, ...
   */
  keys (target, options) {
    return keyboardKeys(target, options)
  },

  /**
   * Creates a signal that emits a value if the keyboard state changes.
   *
   * When a key is pressed or released, then the signal will emit an array
   * containing the key codes of all the currently pressed keys.
   *
   * @param {EventTarget} target The event target (e.g. a DOM element).
   * @param {Object} [options] The options.
   * @param {Booelan} [options.preventDefault=false] A boolean indicating whether
   * the default action should be taken for the event.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Keyboard } from 'bulb-input'
   *
   * const s = Keyboard.state(document)
   *
   * s.subscribe(console.log) // [1], [1, 2], ...
   */
  state (target, options) {
    return keyboardState(target, options)
  }
}

/**
 * This module provides functions to creating signals that wrap the mouse input
 * device.
 */
export const Mouse = {
  /**
   * Creates a signal that emits a value if a mouse button is pressed.
   *
   * When a mouse button is pressed, then the signal will emit an integer
   * representing the logical sum of the currently pressed button codes (left=1,
   * right=2, middle=4).
   *
   * @param {EventTarget} target The event target (e.g. a DOM element).
   * @param {Object} [options] The options.
   * @param {Booelan} [options.preventDefault=false] A boolean indicating whether
   * the default action should be taken for the event.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { mouse } from 'bulb-input'
   *
   * const s = Mouse.buttons(document)
   *
   * s.subscribe(console.log) // 1, 2, ...
   */
  buttons (target, options) {
    return mouseButtons(target, options)
  },

  /**
   * Creates a signal that emits a value if the mouse is moved.
   *
   * When the mouse is moved, then the signal will emit an array containing the
   * mouse position.
   *
   * @param {EventTarget} target The event target (e.g. a DOM element).
   * @param {Object} [options] The options.
   * @param {Booelan} [options.preventDefault=false] A boolean indicating whether
   * the default action should be taken for the event.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { mouse } from 'bulb-input'
   *
   * const s = Mouse.position(document)
   *
   * s.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  position (target, options) {
    return mousePosition(target, options)
  },

  /**
   * Creates a signal that emits a value if the mouse state changes.
   *
   * When the mouse is moved or a button is pressed, then the signal will emit
   * an object representing the current state of the mouse.
   *
   * @param {EventTarget} target The event target (e.g. a DOM element).
   * @param {Object} [options] The options.
   * @param {Booelan} [options.preventDefault=false] A boolean indicating whether
   * the default action should be taken for the event.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { mouse } from 'bulb-input'
   *
   * const s = Mouse.state(document)
   *
   * s.subscribe(console.log) // { buttons: 1, clientX: 1, clientY: 1, ... }, ...
   */
  state (target, options) {
    return mouseState(target, options)
  }
}
