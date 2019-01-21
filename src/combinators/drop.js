import stateMachine from './stateMachine'

/**
 * Drops the first `n` values emitted by the signal `s`.
 *
 * @private
 */
export default function drop (n, s) {
  return stateMachine((a, b, emit) => {
    if (a >= n) { emit.value(b) }
    return a + 1
  }, 0, s)
}
