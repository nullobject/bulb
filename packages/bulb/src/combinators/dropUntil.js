/**
 * Drops values emitted by the target signal `t` until the control signal `s`
 * emits a value.
 *
 * @private
 */
export default function dropUntil (s, t) {
  return emit => {
    let enabled = false

    const subscriptions = [
      t.subscribe({
        ...emit,
        next (a) { if (enabled) { emit.next(a) } }
      }),
      s.subscribe({
        ...emit,
        next () { enabled = true }
      })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  }
}
