import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Removes duplicate values from a signal using a comparator function `f`.
 *
 * @param {Function} f A comparator function.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 2, 3, 3, 3])
 *
 * // A signal with duplicates removed.
 * // e.g. 1, 2, 3
 * dedupeWith((a, b) => a === b, s)
 */
export function dedupeWith (f, s) {
  return stateMachine((a, b, emit) => {
    if (!f(a, b)) { emit.value(b) }
    return b
  }, null, s)
}

export default curry(dedupeWith)
