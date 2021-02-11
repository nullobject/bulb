/**
 * Applies the function `f` to the latest values emitted by the signals `ss`.
 * The returned signal will complete when *any* of the given signals have
 * completed.
 *
 * The returned signal will complete when *any* of the given signals have
 * completed.
 *
 * @private
 */
export default function zipLatestWith (f, ss) {
  return emit => {
    const buffer = new Array(ss.length)
    let enabled = false
    let completed = false
    let nextMask = 0
    let completeMask = 0

    // Checks whether all mask bits are set
    const checkMask = mask => mask === (1 << ss.length) - 1

    // Emits the next value if all signals are enabled
    const tryNext = () => {
      enabled ||= checkMask(nextMask)
      if (enabled) { emit.next(f(...buffer)) }
    }

    // Emits a complete event if all signals are completed
    const tryComplete = () => {
      completed ||= checkMask(completeMask)
      if (completed) { emit.complete() }
    }

    const subscriptions = ss.map((rs, i) =>
      rs.subscribe({
        ...emit,
        next (a) {
          buffer[i] = a
          nextMask |= 1 << i
          tryNext()
        },
        complete (a) {
          completeMask |= 1 << i
          tryComplete()
        }
      })
    )

    // Return the unmount function
    return () => subscriptions.forEach(s => s.unsubscribe())
  }
}
