import stateMachine from './stateMachine'

/**
 * Removes duplicate values emitted by the signal `s` using a comparator
 * function `f`.
 *
 * @private
 */
export default function dedupeWith (f, s) {
  return stateMachine((a, b, emit) => {
    if (!f(a, b)) { emit.value(b) }
    return b
  }, null, s)
}
