import Signal from '../Signal'

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
 * import { keyboardState } from 'bulb'
 *
 * const s = keyboardState(document)
 *
 * s.subscribe(console.log) // [1], [1, 2], ...
 */
export default function keyboardState (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    let state = new Set()

    const downHandler = e => {
      if (options.preventDefault) { e.preventDefault() }

      const key = parseInt(e.keyCode)

      if (!state.has(key)) {
        state.add(key)
        emit.value(Array.from(state))
      }
    }

    const upHandler = e => {
      if (options.preventDefault) { e.preventDefault() }

      const key = parseInt(e.keyCode)

      if (state.has(key)) {
        state.delete(key)
        emit.value(Array.from(state))
      }
    }

    target.addEventListener('keydown', downHandler, true)
    target.addEventListener('keyup', upHandler, true)

    return () => {
      target.removeEventListener('keydown', downHandler, true)
      target.removeEventListener('keyup', upHandler, true)
    }
  })
}
