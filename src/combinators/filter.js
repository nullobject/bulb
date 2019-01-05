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
 * // A signal that only emits positive values emitted by the given signal.
 * filter(a => a > 0, signal)
 */
export function filter (p, s) {
  return new Signal(emit => {
    const value = a => { if (p(a)) { emit.value(a) } }
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}

export default curry(filter)
