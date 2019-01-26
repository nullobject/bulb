import stateMachine from './stateMachine'

/**
 * Cycles through the values of an array `as` for every value emitted by the
 * signal `s`.
 *
 * @private
 */
export default function cycle (as, s) {
  return stateMachine((a, b, emit) => {
    emit.value(as[a])
    return (a + 1) % as.length
  }, 0, s)
}
