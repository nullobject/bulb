import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Stops emitting events from the target signal `t` while the control signal
 * `s` is truthy.
 *
 * @param {Signal} s The control signal.
 * @param {Signal} t The target signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { mouseButton, mousePosition } from 'bulb'
 *
 * const s = mouseButton(document)
 * const t = mousePosition(document)
 * const u = hold(s, t)
 *
 * u.subscribe(console.log) // [1, 1], [2, 2], ...
 */
export function hold (s, t) {
  return new Signal(emit => {
    let hold

    const value = a => {
      if (!hold) { emit.value(a) }
    }

    const subscriptions = [
      t.subscribe({ ...emit, value }),

      // Set the hold value.
      s.subscribe({ ...emit, value: a => { hold = a } })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

export default curry(hold)
