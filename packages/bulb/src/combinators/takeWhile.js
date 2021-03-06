import stateMachine from './stateMachine'

/**
 * Emits values from the signal `s` while the predicate function `p` is
 * satisfied. The returned signal will complete once the predicate function is
 * not satisfied.
 *
 * @private
 */
export default function takeWhile (p, s) {
  return stateMachine((enabled, a, emit) => {
    if (enabled) {
      if (p(a)) {
        emit.next(a)
      } else {
        emit.complete()
        enabled = false
      }
    }
    return enabled
  }, true, s)
}
