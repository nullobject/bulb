import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Drops values emitted by the signal `s` while the predicate function `p` is
 * satisfied. The returned signal will emit values once the predicate function
 * is not satisfied.
 *
 * @param {Function} p The predicate function to apply to each value emitted by
 * the signal. If it returns `true`, the value will not be emitted, otherwise
 * the value will be emitted.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, dropWhile } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = dropWhile(a => a < 2, s)
 *
 * t.subscribe(console.log) // 2, 3
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
