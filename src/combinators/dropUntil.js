import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Drops values emitted by the target signal `t` until the control signal `s`
 * emits a value.
 *
 * @param {Signal} s The control signal.
 * @param {Signal} t The target signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.of().delay(1000)
 * const t = Signal.periodic(1000).sequential([1, 2, 3])
 * const u = dropUntil(s, t)
 *
 * u.subscribe(console.log) // 2, 3
 */
export function dropUntil (s, t) {
  return new Signal(emit => {
    let enabled = false

    const value = a => {
      if (enabled) { emit.value(a) }
    }

    const subscriptions = [
      t.subscribe({ ...emit, value }),
      s.subscribe({ ...emit, value: () => { enabled = true } })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

export default curry(dropUntil)
