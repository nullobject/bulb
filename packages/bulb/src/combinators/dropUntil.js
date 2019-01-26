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

    const value = a => {
      if (enabled) { emit.value(a) }
    }

    const subscriptions = [
      t.subscribe({ ...emit, value }),
      s.subscribe({ ...emit, value: () => { enabled = true } })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
