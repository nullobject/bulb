import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Filters the signal `s` by only emitting values that satisfy a predicate
 * function `p`.
 *
 * @param {Function} p The predicate function to apply to each value emitted by
 * the signal. If it returns `true`, the value will be emitted, otherwise the
 * value will not be emitted.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, filter } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = filter(a => a > 1, s)
 *
 * t.subscribe(console.log) // 2, 3
 */
export function filter (p, s) {
  return new Signal(emit => {
    const value = a => { if (p(a)) { emit.value(a) } }
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}

export default curry(filter)
