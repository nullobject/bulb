import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Filters a signal using a predicate function `p`.
 *
 * @param {Function} p A predicate function.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 3])
 *
 * // A signal that only emits values greater than one.
 * // e.g. 2, 3
 * filter(a => a > 1, s)
 */
export function filter (p, s) {
  return new Signal(emit => {
    const value = a => { if (p(a)) { emit.value(a) } }
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}

export default curry(filter)
