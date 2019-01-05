import { all, replicate } from 'fkit'

import Signal from '../Signal'

/**
 * Generalises the `zip` function to combine corresponding values from the
 * given signals using the function `f`.
 *
 * The signal completes when *any* of the input signals have completed.
 *
 * @param {Function} f A function.
 * @param {Array} ss An array of signals.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = Signal.fromArray([4, 5, 6])
 *
 * // A signal that emits the sum of the corresponding values.
 * zipWith((a, b) => a + b, s, t)
 */
export default function zipWith (f, ...ss) {
  // Allow the signals to be given as an array.
  if (ss.length === 1 && Array.isArray(ss[0])) {
    ss = ss[0]
  }

  return new Signal(emit => {
    const buffers = replicate(ss.length, [])

    const value = (a, index) => {
      // Buffer the value.
      buffers[index].push(a)

      // Check if each of the signals have at least one buffered value.
      if (all(buffer => buffer.length > 0, buffers)) {
        // Get the next buffered value for each of the signals.
        const as = buffers.reduce((as, buffer) => {
          as.push(buffer.shift())
          return as
        }, [])

        // Emit the value.
        emit.value(f(...as))
      }
    }

    const subscriptions = ss.map((s, i) =>
      s.subscribe(a => value(a, i), emit.error, emit.complete)
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
