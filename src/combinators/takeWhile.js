import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Emits values from the signal `s` while the predicate function `p` is true,
 * and then completes.
 *
 * @param {Function} p A predicate function.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export function takeWhile (p, s) {
  return stateMachine((a, b, emit) => {
    if (p(b)) {
      emit.value(b)
    } else {
      emit.complete()
    }
  }, null, s)
}

export default curry(takeWhile)
