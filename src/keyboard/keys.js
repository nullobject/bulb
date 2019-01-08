import Signal from '../Signal'

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
 * import { keyboardKeys } from 'bulb'
 *
 * const s = keyboardKeys(document)
 *
 * s.subscribe(console.log) // 1, 2, ...
 */
export default function keyboardKeys (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.value(parseInt(e.keyCode))
    }

    target.addEventListener('keydown', handler, true)

    return () => target.removeEventListener('keydown', handler, true)
  })
}
