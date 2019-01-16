import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Emits the most recent value from the target signal `t` whenever the control
 * signal `s` emits a value.
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
      t.subscribe({ ...emit, value: a => { buffer = a } }),
      s.subscribe({ ...emit, value })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

export default curry(sample)
