import Signal from '../Signal'

/**
 * Drops values emitted by the target signal `t` until the control signal `s`
 * emits a value.
 *
 * @private
 */
export default function dropUntil (s, t) {
  return new Signal(emit => {
    let enabled = false

    const next = a => {
      if (enabled) { emit.next(a) }
    }

    const subscriptions = [
      t.subscribe({ ...emit, next }),
      s.subscribe({ ...emit, next: () => { enabled = true } })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
