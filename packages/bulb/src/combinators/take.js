import stateMachine from './stateMachine'

/**
 * Takes the first `n` values emitted by the signal `s`, and then completes.
 *
 * @private
 */
export default function take (n, s) {
  return stateMachine((a, b, emit) => {
    emit.value(b)
    if (a >= n - 1) { emit.complete() }
    return a + 1
  }, 0, s)
}
