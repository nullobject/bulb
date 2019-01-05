import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Removes duplicate values from a signal using a comparator function `f`.
 *
 * @param {Function} f A comparator function.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export function dedupeWith (f, s) {
  return stateMachine((a, b, emit) => {
    if (!f(a, b)) { emit.value(b) }
    return b
  }, null, s)
}

export default curry(dedupeWith)
