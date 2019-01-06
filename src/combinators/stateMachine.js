import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Runs a state machine over the signal using a transform function `t`. The
 * transform function must return a new state, it can also optionally emit
 * values or errors using the `emit` object.
 *
 * @param {Function} f A transform function.
 * @param a The initial state.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 3])
 *
 * // A signal that emits the running total of the products of the values.
 * // e.g. 1, 3, 5
 * stateMachine((a, b, emit) => {
 *   emit.value(a + b)
 *   return a * b
 * }, 1, s)
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
