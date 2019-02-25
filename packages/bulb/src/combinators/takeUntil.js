/**
 * Emits values from the target signal `t` until the control signal `s` emits a
 * value. The returned signal will complete once the control signal emits a
 * value.
 *
 * @private
 */
export default function takeUntil (s, t) {
  return emit => {
    const subscriptions = [
      t.subscribe(emit),
      s.subscribe({ ...emit, next (a) { emit.complete() } })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  }
}
