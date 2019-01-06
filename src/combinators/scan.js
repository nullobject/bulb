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
 * const s = Signal.fromArray([1, 2, 3])
 *
 * // A signal that emits the sum of the values emitted by the parent signal.
 * // e.g. 1, 3, 6
 * scan((a, b) => a + b, 0, s)
 */
export function scan (f, a, s) {
  return new Signal(emit => {
    // Emit the starting value.
    emit.value(a)

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
