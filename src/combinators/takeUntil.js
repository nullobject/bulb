import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Emits values from the target signal `t` until the control signal `s` emits a
 * value. The returned signal will complete once the control signal emits a
 * value.
 *
 * @param {Signal} s The control signal.
 * @param {Signal} t The target signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.of().delay(1000)
 * const t = Signal.periodic(1000).sequential([1, 2, 3])
 * const u = takeUntil(s, t)
 *
 * u.subscribe(console.log) // 1
 */
export function takeUntil (s, t) {
  return new Signal(emit => {
    const value = a => {
      emit.complete()
    }

    const subscriptions = [
      t.subscribe(emit),
      s.subscribe({ ...emit, value })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

export default curry(takeUntil)
