import Signal from './signal'

/**
 * This module defines keyboard signals.
 *
 * @module bulb/keyboard
 * @summary Keyboard Signals
 */

/**
 * Returns a new signal that emits a value every time the keyboard state
 * changes.
 *
 * @summary Creates a keyboard state signal.
 * @param target The event target that the signal listens on.
 * @returns A new signal.
 */
export function keys (target) {
  let state = {}

  return new Signal(observer => {
    const downHandler = e => {
      if (state[e.keyCode] !== true) {
        state[e.keyCode] = true
        observer.next(state)
      }
    }

    const upHandler = e => {
      if (state[e.keyCode] !== undefined) {
        delete state[e.keyCode]
        observer.next(state)
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
