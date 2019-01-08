import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Emits values from the signal `s` while the predicate function `p` is
 * satisfied. The returned signal will complete once the predicate function is
 * not satisfied.
 *
 * @param {Function} p The predicate function to apply to each value emitted by
 * the signal. If it returns `true`, the value will be emitted, otherwise the
 * value will not be emitted.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = takeWhile(a => a < 2, s)
 *
 * t.subscribe(console.log) // 1
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
