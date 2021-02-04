/**
 * Buffers values emitted by the target signal `t` and emits the buffer contents
 * whenever the control signal `s` emits a value. The buffer contents will be
 * emitted when the signal completes, regardless of whether the buffer is full.
 *
 * @private
 */
export default function bufferWith (s, t) {
  return emit => {
    const buffer = []

    const flush = () => {
      const as = buffer.splice(0)
      if (as.length > 0) { emit.next(as) }
    }

    const subscriptions = [
      s.subscribe(flush),
      t.subscribe({
        ...emit,
        next (a) { buffer.push(a) },
        complete () {
          flush()
          emit.complete()
        }
      })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  }
}
