import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Takes the first `n` values emitted by the signal `s`, and then completes.
 *
 * @param {Number} n The number of values to take.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export function take (n, s) {
  return stateMachine((a, b, emit) => {
    emit.value(b)
    if (a >= n - 1) {
      emit.complete()
    }
    return a + 1
  }, 0, s)
}

export default curry(take)
