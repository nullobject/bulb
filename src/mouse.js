import Signal from './Signal'

/**
 * Creates a signal that emits a value if the mouse state changes.
 *
 * When the mouse is moved or a button is pressed, then the signal will emit
 * an object representing the current state of the mouse.
 *
 * @param {Element} target A DOM element.
 * @param {Object} options An options object.
 * @returns {Signal} A new signal.
 */
export function state (target, options = {}) {
  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }

      emit.value({
        buttons: e.buttons,
        x: e.clientX,
        y: e.clientY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey
      })
    }

    target.addEventListener('mousemove', handler, true)
    target.addEventListener('mousedown', handler, true)
    target.addEventListener('mouseup', handler, true)

    return () => {
      target.removeEventListener('mousemove', handler, true)
      target.removeEventListener('mousedown', handler, true)
      target.removeEventListener('mouseup', handler, true)
    }
  })
}

/**
 * Creates a signal that emits a value if the mouse is moved.
 *
 * When the mouse is moved, then the signal will emit an array containing the
 * mouse position.
 *
 * @param {Element} target A DOM element.
 * @param {Object} options An options object.
 * @returns {Signal} A new signal.
 */
export function position (target, options = {}) {
  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.value([e.clientX, e.clientY])
    }

    target.addEventListener('mousemove', handler, true)

    return () => target.removeEventListener('mousemove', handler, true)
  })
}

/**
 * Creates a signal that emits a value if a mouse button is pressed.
 *
 * When a mouse button is pressed, then the signal will emit an integer
 * representing the logical sum of the currently pressed button codes (left=1,
 * right=2, middle=4).
 *
 * @summary Creates a mouse button signal.
 * @param {Element} target A DOM element.
 * @param {Object} options An options object.
 * @returns {Signal} A new signal.
 */
export function buttons (target, options = {}) {
  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.value(e.buttons)
    }

    target.addEventListener('mousedown', handler, true)

    return () => target.removeEventListener('mousedown', handler, true)
  })
}
