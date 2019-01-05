import Signal from '../Signal'

/**
 * Creates a signal that emits a value if a mouse button is pressed.
 *
 * When a mouse button is pressed, then the signal will emit an integer
 * representing the logical sum of the currently pressed button codes (left=1,
 * right=2, middle=4).
 *
 * @summary Creates a mouse button signal.
 * @param {Element} target A DOM element.
 * @param {Object} [options] An options object.
 * @param {Booelan} [options.preventDefault=false] A boolean indicating
 * whether the default action should be taken for the event.
 * @returns {Signal} A new signal.
 */
export default function mouseButtons (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.value(e.buttons)
    }

    target.addEventListener('mousedown', handler, true)

    return () => target.removeEventListener('mousedown', handler, true)
  })
}
