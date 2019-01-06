import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Stops emitting events from target signal `t` while the most recent value
 * from the control signal `s` is truthy.
 *
 * It will resume emitting events after there is a falsey value.
 *
 * @param {Signal} s The control signal.
 * @param {Signal} t The target signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = mouseButton(document)
 * const t = mousePosition(document)
 *
 * // A signal that emits the mouse position while no mouse button is down.
 * hold(s, t)
 */
export function hold (s, t) {
  return new Signal(emit => {
    let hold

    const value = a => {
      // Emit the value if the hold is open.
      if (!hold) { emit.value(a) }
    }

    const subscriptions = [
      t.subscribe({ ...emit, value }),

      // Set the hold value.
      s.subscribe(a => { hold = a }, emit.error, emit.complete)
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

export default curry(hold)
