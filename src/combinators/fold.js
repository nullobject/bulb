import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Applies an accumulator function `f` to each value emitted by the signal `s`.
 * The accumulated value will be emitted when the signal has completed.
 *
 * @param {Function} f The accumulator function to apply to each value emitted
 * by the signal.
 * @param a The starting value.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, fold } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = fold((a, b) => a + b, 0, s)
 *
 * t.subscribe(console.log) // 6
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
