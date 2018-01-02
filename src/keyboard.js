import Signal from './signal'

/**
 * This module defines keyboard signals.
 *
 * @module keyboard
 * @summary Keyboard Signals
 */

/**
 * Creates a signal that emits a value if the keyboard state changes.
 *
 * When a key is pressed or released, then the signal will emit an array
 * containing the key codes of all the currently pressed keys.
 *
 * @summary Creates a keyboard state signal.
 * @param target A DOM element.
 * @param options An options object.
 * @returns A new signal.
 */
export function state (target, options = {}) {
  let state = new Set()

  return new Signal(emit => {
    const downHandler = e => {
      if (options.preventDefault) { e.preventDefault() }

      const key = parseInt(e.keyCode)

      if (!state.has(key)) {
        state.add(key)
        emit.next(Array.from(state))
      }
    }

    const upHandler = e => {
      if (options.preventDefault) { e.preventDefault() }

      const key = parseInt(e.keyCode)

      if (state.has(key)) {
        state.delete(key)
        emit.next(Array.from(state))
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

/**
 * Creates a signal that emits a value if a key is pressed on the `target`
 * DOM element.
 *
 * If a key is held down continuously, then the signal will repeatedly emit
 * values at a rate determined by your OS key repeat setting.
 *
 * @summary Creates a keyboard keydown signal.
 * @param target A DOM element.
 * @param options An options object.
 * @returns A new signal.
 */
export function keys (target, options = {}) {
  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.next(parseInt(e.keyCode))
    }

    target.addEventListener('keydown', handler, true)

    return () => target.removeEventListener('keydown', handler, true)
  })
}
