import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Drops the first `n` values emitted by the signal `s`.
 *
 * @param {Number} n The number of values to drop.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export function drop (n, s) {
  return stateMachine((a, b, emit) => {
    if (a >= n) {
      emit.value(b)
    }
    return a + 1
  }, 0, s)
}

export default curry(drop)
