import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Takes the first `n` values emitted by the signal `s`, and then completes.
 *
 * @param {Number} n The number of values to take.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, take } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = take(2, s)
 *
 * t.subscribe(console.log) // 1, 2
 */
export function take (n, s) {
  return stateMachine((a, b, emit) => {
    emit.value(b)
    if (a >= n - 1) { emit.complete() }
    return a + 1
  }, 0, s)
}

export default curry(take)
