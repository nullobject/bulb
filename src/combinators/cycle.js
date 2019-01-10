import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Cycles through the values of an array `as` for every value emitted by the
 * signal `s`.
 *
 * @param {Array} as The values to emit.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, cycle } from 'bulb'
 *
 * const s = Signal.periodic(1000)
 * const t = cycle([1, 2, 3], s)
 *
 * t.subscribe(console.log) // 1, 2, 3, 1, 2, 3, ...
 */
export function cycle (as, s) {
  return stateMachine((a, b, emit) => {
    emit.value(as[a])
    return (a + 1) % as.length
  }, 0, s)
}

export default curry(cycle)
