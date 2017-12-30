import Signal from './signal'

/**
 * This module defines keyboard signals.
 *
 * @module bulb/keyboard
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
 * @returns A new signal.
 */
export function state (target) {
  let state = new Set()

  return new Signal(emit => {
    const downHandler = e => {
      const key = parseInt(e.keyCode)
      if (!state.has(key)) {
        state.add(key)
        emit.next(Array.from(state))
      }
    }

    const upHandler = e => {
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
 * @returns A new signal.
 */
export function key (target) {
  return new Signal(emit => {
    const handler = e => {
      emit.next({
        key: e.key,
        code: parseInt(e.keyCode),
        repeat: e.repeat,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey
      })
    }

    target.addEventListener('keydown', handler, true)

    return () => target.removeEventListener('keydown', handler, true)
  })
}
