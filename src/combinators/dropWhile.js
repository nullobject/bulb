import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Drops values from the signal `s` while the predicate function `p` is true.
 *
 * @param {Function} p A predicate function.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export function dropWhile (p, s) {
  return stateMachine((a, b, emit) => {
    if (a || !p(b)) {
      emit.value(b)
      a = true
    }
    return a
  }, false, s)
}

export default curry(dropWhile)
