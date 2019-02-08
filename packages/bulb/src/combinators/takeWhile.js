import stateMachine from './stateMachine'

/**
 * Emits values from the signal `s` while the predicate function `p` is
 * satisfied. The returned signal will complete once the predicate function is
 * not satisfied.
 *
 * @private
 */
export default function takeWhile (p, s) {
  return stateMachine((a, b, emit) => {
    if (p(b)) {
      emit.next(b)
    } else {
      emit.complete()
    }
  }, null, s)
}
