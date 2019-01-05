import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Scans a function `f` over the signal `s`. Unlike the `fold` function, the
 * signal values are emitted incrementally.
 *
 * @param {Function} f A function.
 * @param a A starting value.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * // A signal that emits the running total of the values emitted by the given
 * // signal.
 * scan((a, b) => a + b, 0, signal)
 */
export function scan (f, a, s) {
  return new Signal(emit => {
    // Emit the starting value.
    setTimeout(() => emit.value(a), 0)

    // Fold the current value with the previous value and emit the next value
    const value = b => {
      a = f(a, b)
      emit.value(a)
    }

    const subscription = s.subscribe({ ...emit, value })

    return () => subscription.unsubscribe()
  })
}

export default curry(scan)
