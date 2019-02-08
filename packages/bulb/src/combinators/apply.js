import { all, id } from 'fkit'

import Signal from '../Signal'

/**
 * Applies the latest function emitted by the signal `s` to latest values
 * emitted by the signals `ts`. The returned signal will complete when *any* of
 * the given signals have completed.
 *
 * @private
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
      if (f && all(id, values)) { emit.next(f(...values)) }
    }

    const functionHandler = a => {
      f = a
      flush()
    }

    const nextHandler = index => a => {
      values[index] = a
      flush()
    }

    const subscriptions = ts.map((t, i) =>
      t.subscribe({ ...emit, next: nextHandler(i) })
    ).concat(
      s.subscribe({ ...emit, next: functionHandler })
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
