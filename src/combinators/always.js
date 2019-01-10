import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Replaces the values of the signal `s` with a constant `c`.
 *
 * @param c The constant value.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, always } from 'bulb'
 *
 * const s = Signal.fromArray[1, 2, 3]
 * const t = always(1, s)
 *
 * t.subscribe(console.log) // 1, 1, 1
 */
export function always (c, s) {
  return new Signal(emit => {
    const value = () => emit.value(c)
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}

export default curry(always)
