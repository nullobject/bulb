import Signal from '../Signal'

/**
 * Emits values from the target signal `t` until the control signal `s` emits a
 * value. The returned signal will complete once the control signal emits a
 * value.
 *
 * @private
 */
export default function takeUntil (s, t) {
  return new Signal(emit => {
    const value = a => {
      emit.complete()
    }

    const subscriptions = [
      t.subscribe(emit),
      s.subscribe({ ...emit, value })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
