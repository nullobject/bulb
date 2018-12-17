import { curry, equal } from 'fkit'

import Signal from '../signal'

/**
 * This module defines filter combinators for signals.
 *
 * @private
 * @module combinators/filter
 */

/**
 * Filters the signal `s` to only emit values that satisfy the predicate `p`.
 *
 * @curried
 * @function
 * @param p A predicate function.
 * @param s A signal.
 * @returns A new signal.
 */
export const filter = curry((p, s) => {
  return new Signal(emit => {
    const next = a => { if (p(a)) { emit.next(a) } }
    return s.subscribe({ ...emit, next })
  })
})

/**
 * Removes duplicate values from the signal `s`.
 *
 * @param s A signal.
 * @returns A new signal.
 */
export function dedupe (s) {
  return s.dedupeWith(equal)
}

/**
 * Removes duplicate values from the signal `s` using the comparator function
 * `f`.
 *
 * @curried
 * @function
 * @param f A comparator function.
 * @param s A signal.
 * @returns A new signal.
 */
export const dedupeWith = curry((f, s) => {
  return s.stateMachine((a, b, emit) => {
    if (!f(a, b)) { emit.next(b) }
    return b
  })
})
