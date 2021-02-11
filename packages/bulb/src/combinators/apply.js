/**
 * Applies the latest function emitted by the signal `s` to latest values
 * emitted by the signals `ts`.
 *
 * @private
 */
export default function apply (s, ts) {
  return emit => {
    const buffer = new Array(ts.length)
    let f
    let enabled = false
    let completed = false
    let nextMask = 0
    let completeMask = 0

    // Checks whether all mask bits are set
    const checkMask = mask => mask === (1 << ts.length) - 1

    // Emits the next value if all signals are enabled
    const tryNext = () => {
      enabled ||= checkMask(nextMask)
      if (f && enabled) { emit.next(f(...buffer)) }
    }

    // Emits a complete event if all signals are completed
    const tryComplete = () => {
      completed ||= checkMask(completeMask)
      if (completed) { emit.complete() }
    }

    const subscriptions = [
      s.subscribe({
        ...emit,
        next (a) {
          f = a
          tryNext()
        },
        complete: null
      }),
      ...ts.flatMap((t, i) =>
        t.subscribe({
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
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  }
}
