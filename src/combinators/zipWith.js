import { all, replicate } from 'fkit'

import Signal from '../Signal'

/**
 * Applies the function `f` to the corresponding values emitted by the signals
 * `ss`. The returned signal will complete when *any* of the given signals have
 * completed.
 *
 * @param {Function} f The function to apply to the corresponding values
 * emitted by the signals.
 * @param {Array} ss The signals to zip.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, zipWith } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = Signal.fromArray([4, 5, 6])
 * const u = zipWith((a, b) => a + b, s, t)
 *
 * u.subscribe(console.log) // 5, 7, 9
 */
export default function zipWith (f, ...ss) {
  // Allow the signals to be given as an array.
  if (ss.length === 1 && Array.isArray(ss[0])) {
    ss = ss[0]
  }

  return new Signal(emit => {
    const buffers = replicate(ss.length, [])

    const value = index => a => {
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
      s.subscribe({ ...emit, value: value(i) })
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
