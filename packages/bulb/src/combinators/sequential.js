import stateMachine from './stateMachine'

/**
 * Emits the next value from an array `as` for every value emitted by the
 * signal `s`. The returned signal will complete immediately after the last
 * value has been emitted.
 *
 * @private
 */
export default function sequential (as, s) {
  return stateMachine((a, b, emit) => {
    emit.value(as[a])
    if (a === as.length - 1) { emit.complete() }
    return a + 1
  }, 0, s)
}
