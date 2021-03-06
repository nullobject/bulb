import stateMachine from './stateMachine'

/**
 * Takes the first `n` values emitted by the signal `s`, and then completes.
 *
 * @private
 */
export default function take (n, s) {
  return stateMachine(([enabled, counter], a, emit) => {
    if (enabled) {
      emit.next(a)
      if (counter === n - 1) {
        emit.complete()
        enabled = false
      }
    }
    return [enabled, counter + 1]
  }, [true, 0], s)
}
