import Signal from '../Signal'

/**
 * Applies the function `f` to the corresponding values emitted by the signals
 * `ss`. The returned signal will complete when *any* of the given signals have
 * completed.
 *
 * @private
 */
export default function zipWith (f, ss) {
  return new Signal(emit => {
    // Build the empty buffers.
    const buffers = Array.from({ length: ss.length }, () => [])

    // Checks each of the signals have at least one buffered value.
    const bufferIsFull = () => buffers.every(buffer => buffer.length > 0)

    const flush = () => {
      if (bufferIsFull()) {
        // Get the next buffered value for each of the signals.
        const as = buffers.reduce((as, buffer) => {
          as.push(buffer.shift())
          return as
        }, [])

        // Emit the value.
        emit.next(f(...as))
      }
    }

    const subscriptions = ss.map((s, i) =>
      s.subscribe({ ...emit,
        next (a) {
          buffers[i].push(a)
          flush()
        }
      })
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
