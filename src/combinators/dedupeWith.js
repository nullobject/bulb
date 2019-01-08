import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Removes duplicate values emitted by the signal `s` using a comparator
 * function `f`.
 *
 * @param {Function} f The comparator function to apply to successive values
 * emitted by the signal. If the value is distinct from the previous value,
 * then the comparator function should return `true`, otherwise it should
 * return `false`.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, dedupeWith } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 2, 3, 3, 3])
 * const t = dedupeWith((a, b) => a === b, s)
 *
 * t.subscribe(console.log) // 1, 2, 3
 */
export function dedupeWith (f, s) {
  return stateMachine((a, b, emit) => {
    if (!f(a, b)) { emit.value(b) }
    return b
  }, null, s)
}

export default curry(dedupeWith)
