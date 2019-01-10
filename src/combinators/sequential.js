import { curry } from 'fkit'

import stateMachine from './stateMachine'

/**
 * Emits the next value from an array `as` for every value emitted by the
 * signal `s`. The returned signal will complete immediately after the last
 * value has been emitted.
 *
 * @param {Array} as The values to emit.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, sequential } from 'bulb'
 *
 * const s = Signal.periodic(1000)
 * const t = sequential([1, 2, 3], s)
 *
 * t.subscribe(console.log) // 1, 2, 3
 */
export function sequential (as, s) {
  return stateMachine((a, b, emit) => {
    emit.value(as[a])
    if (a === as.length - 1) {
      emit.complete()
    }
    return a + 1
  }, 0, s)
}

export default curry(sequential)
