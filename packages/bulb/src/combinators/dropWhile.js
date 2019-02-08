import stateMachine from './stateMachine'

/**
 * Drops values emitted by the signal `s` while the predicate function `p` is
 * satisfied. The returned signal will emit values once the predicate function
 * is not satisfied.
 *
 * @private
 */
export default function dropWhile (p, s) {
  return stateMachine((a, b, emit) => {
    if (a || !p(b)) {
      emit.next(b)
      a = true
    }
    return a
  }, false, s)
}
