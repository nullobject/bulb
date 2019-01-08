import Signal from '../Signal'

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
 * import { mousePosition } from 'bulb'
 *
 * const s = mousePosition(document)
 *
 * s.subscribe(console.log) // [1, 1], [2, 2], ...
 */
export default function mousePosition (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.value([e.clientX, e.clientY])
    }

    target.addEventListener('mousemove', handler, true)

    return () => target.removeEventListener('mousemove', handler, true)
  })
}
