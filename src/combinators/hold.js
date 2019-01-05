import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Pauses emitting events from signal `t` if the most recent value from the
 * hold signal `s` is truthy.
 *
 * It will resume emitting events after there is a falsey value.
 *
 * @param {Signal} s A signal.
 * @param {Signal} t A signal.
 * @returns {Signal} A new signal.
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
