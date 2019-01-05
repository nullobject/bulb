import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Folds a function `f` over the signal `s`. The final value is emitted when
 * the signal completes.
 *
 * @param {Function} f A function.
 * @param a A starting value.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * // A signal that emits the total of the values emitted by the given signal.
 * // The total is emitted only after the given signal is complete.
 * fold((a, b) => a + b, 0, signal)
 */
export function fold (f, a, s) {
  return new Signal(emit => {
    // Fold the next value with the previous value.
    const value = b => { a = f(a, b) }

    const complete = () => {
      // Emit the final value.
      emit.value(a)
      emit.complete()
    }

    const subscription = s.subscribe({ ...emit, value, complete })

    return () => subscription.unsubscribe()
  })
}

export default curry(fold)
