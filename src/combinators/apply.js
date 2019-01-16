import { all, id } from 'fkit'

import Signal from '../Signal'

/**
 * Applies the latest function emitted by the signal `s` to latest values
 * emitted by the signals `ts`. The returned signal will complete when *any* of
 * the given signals have completed.
 *
 * The latest function will be applied with a number of arguments equal to the
 * number of signals in `ts`. For example, if the latest function is `(a, b) =>
 * a + b`, then `ts` will need to contain two signals.
 *
 * @param {Signal} s The function signal.
 * @param {Array} ts The value signals.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, apply } from 'bulb'
 *
 * const s = Signal.fromArray([(a, b) => a + b])
 * const t = Signal.fromArray([1, 2, 3])
 * const u = Signal.fromArray([4, 5, 6])
 * const v = apply(s, t, u)
 *
 * v.subscribe(console.log) // 5, 7, 9
 */
export default function apply (s, ...ts) {
  // Allow the signals to be given as an array.
  if (ts.length === 1 && Array.isArray(ts[0])) {
    ts = ts[0]
  }

  return new Signal(emit => {
    let f
    const values = new Array(ts.length)

    const flush = () => {
      if (f && all(id, values)) {
        emit.value(f(...values))
      }
    }

    const functionHandler = a => {
      f = a
      flush()
    }

    const valueHandler = index => a => {
      values[index] = a
      flush()
    }

    const subscriptions = ts.map((t, i) =>
      t.subscribe({ ...emit, value: valueHandler(i) })
    ).concat(
      s.subscribe({ ...emit, value: functionHandler })
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
