import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Applies a transform function `f` to each value emitted by the signal `s`.
 *
 * The transform function must return a new state, it can also optionally emit
 * values or errors using the `emit` object.
 *
 * @param {Function} f The transform function to apply to each value emitted by
 * the signal.
 * @param a The initial state.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, stateMachine } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = stateMachine((a, b, emit) => {
 *   emit.value(a + b)
 *   return a * b
 * }, 1, s)
 *
 * t.subscribe(console.log) // 1, 3, 5
 */
export function stateMachine (f, a, s) {
  return new Signal(emit => {
    const value = b => {
      // Fold the next value with the previous value.
      a = f(a, b, emit)
    }

    const subscription = s.subscribe({ ...emit, value })

    return () => subscription.unsubscribe()
  })
}

export default curry(stateMachine)
