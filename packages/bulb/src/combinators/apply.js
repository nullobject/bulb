/**
 * Applies the latest function emitted by the signal `s` to latest values
 * emitted by the signals `ts`.
 *
 * @private
 */
export default function apply (s, ts) {
  return emit => {
    let f
    let mask = 0

    const buffer = new Array(ts.length)

    // Checks the bitmask bits are all set.
    const isBufferFull = () => mask === (2 ** ts.length) - 1

    const flush = () => {
      if (f && isBufferFull()) {
        emit.next(f(...buffer))
      }
    }

    const subscriptions = ts.map((t, i) =>
      t.subscribe({
        ...emit,
        next (a) {
          // Set the buffered value.
          buffer[i] = a

          // Set the bit mask for the index.
          mask |= 2 ** i

          flush()
        }
      })
    ).concat(
      s.subscribe({
        ...emit,
        next (a) {
          // Set the function.
          f = a

          flush()
        }
      })
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  }
}
