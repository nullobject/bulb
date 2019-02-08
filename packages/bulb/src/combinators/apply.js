import { all, id } from 'fkit'

import Signal from '../Signal'

/**
 * Applies the latest function emitted by the signal `s` to latest values
 * emitted by the signals `ts`. The returned signal will complete when *any* of
 * the given signals have completed.
 *
 * @private
 */
export default function apply (s, ts) {
  return new Signal(emit => {
    let f

    const values = new Array(ts.length)

    const flush = () => {
      // Check if each of the signals have a buffered value.
      if (f && all(id, values)) {
        emit.next(f(...values))
      }
    }

    const subscriptions = ts.map((t, i) =>
      t.subscribe({ ...emit,
        next (a) {
          values[i] = a
          flush()
        }
      })
    ).concat(
      s.subscribe({ ...emit,
        next (a) {
          f = a
          flush()
        }
      })
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
