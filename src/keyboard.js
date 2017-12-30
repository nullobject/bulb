import Signal from './signal'

/**
 * This module defines keyboard signals.
 *
 * @module bulb/keyboard
 * @summary Keyboard Signals
 */

/**
 * Creates a signal that emits a value every time the keyboard state changes.
 *
 * @summary Creates a keyboard state signal.
 * @param target The event target that the signal listens on.
 * @returns A new signal.
 */
export function state (target) {
  let state = new Set()

  return new Signal(emit => {
    const downHandler = e => {
      const key = parseInt(e.keyCode)
      if (!state.has(key)) {
        state.add(key)
        emit.next(state)
      }
    }

    const upHandler = e => {
      const key = parseInt(e.keyCode)
      if (state.has(key)) {
        state.delete(key)
        emit.next(state)
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
