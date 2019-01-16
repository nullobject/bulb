import { curry } from 'fkit'

import Signal from '../Signal'
import { asap } from '../scheduler'

/**
 * Applies an accumulator function `f` to each value emitted by the signal `s`.
 * The accumulated value will be emitted for each value emitted by the signal.
 *
 * @param {Function} f The accumulator function to apply to each value emitted
 * by the signal.
 * @param a The starting value.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, scan } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = scan((a, b) => a + b, 0, s)
 *
 * t.subscribe(console.log) // 1, 3, 6
 */
export function scan (f, a, s) {
  return new Signal(emit => {
    // Emit the starting value.
    asap(() => { emit.value(a) })

    const value = b => {
      // Fold the current value with the previous value.
      a = f(a, b)
      emit.value(a)
    }

    const subscription = s.subscribe({ ...emit, value })

    return () => subscription.unsubscribe()
  })
}

export default curry(scan)
