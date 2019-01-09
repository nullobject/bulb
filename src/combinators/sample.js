import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Emits the most recent value from the target signal `t` when there is an
 * event on the control signal `s`.
 *
 * @param {Signal} s The control signal.
 * @param {Signal} t The target signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, mousePosition, sample } from 'bulb'
 *
 * const s = Signal.periodic(1000)
 * const t = mousePosition()
 * const u = sample(s, t)
 *
 * u.subscribe(console.log) // [1, 1], [2, 2], ...
 */
export function sample (s, t) {
  return new Signal(emit => {
    let buffer

    const value = () => {
      if (buffer !== undefined) { emit.value(buffer) }
    }

    const subscriptions = [
      s.subscribe({ ...emit, value }),

      // Buffer the last value.
      t.subscribe({ ...emit, value: a => { buffer = a } })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

export default curry(sample)
