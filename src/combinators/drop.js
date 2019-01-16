import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Drops the first `n` values emitted by the signal `s`.
 *
 * @param {Number} n The number of values to drop.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, drop } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = drop(2, s)
 *
 * t.subscribe(console.log) // 3
 */
export function drop (n, s) {
  return stateMachine((a, b, emit) => {
    if (a >= n) { emit.value(b) }
    return a + 1
  }, 0, s)
}

export default curry(drop)
