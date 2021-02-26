/**
 * Applies the function `f` to the corresponding values emitted by the signals
 * `ss`. The returned signal will complete when *all* of the given signals have
 * completed.
 *
 * @private
 */
export default function zipWith (f, ss) {
  return emit => {
    const buffers = Array.from({ length: ss.length }, () => [])
    let completed = false
    let completeMask = 0

    // Checks whether all mask bits are set
    const checkMask = mask => mask === (1 << ss.length) - 1

    // Checks each of the signals have at least one buffered value.
    const bufferIsFull = () => buffers.every(buffer => buffer.length > 0)

    const tryNext = () => {
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

    // Emits a complete event if all signals are completed
    const tryComplete = () => {
      completed ||= checkMask(completeMask)
      if (completed) { emit.complete() }
    }

    const subscriptions = ss.map((s, i) =>
      s.subscribe({
        ...emit,
        next (a) {
          buffers[i].push(a)
          tryNext()
        },
        complete () {
          completeMask |= 1 << i
          tryComplete()
        }
      })
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  }
}
