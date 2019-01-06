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
 * const s = Signal.fromArray([1, 2, 3])
 *
 * // A signal that emits the sum of the values emitted by the parent signal.
 * // The sum is emitted only after the parent signal is complete.
 * // e.g. 6
 * fold((a, b) => a + b, 0, s)
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
