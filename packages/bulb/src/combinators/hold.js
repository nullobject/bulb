import Signal from '../Signal'

/**
 * Stops emitting values from the target signal `t` while the control signal
 * `s` is truthy.
 *
 * @private
 */
export default function hold (s, t) {
  return new Signal(emit => {
    let enabled = true

    const value = a => {
      if (enabled) { emit.value(a) }
    }

    const subscriptions = [
      s.subscribe({ ...emit, value: a => { enabled = !a } }),
      t.subscribe({ ...emit, value })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
