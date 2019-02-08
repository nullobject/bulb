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

    const next = a => {
      if (enabled) { emit.next(a) }
    }

    const subscriptions = [
      s.subscribe({ ...emit, next: a => { enabled = !a } }),
      t.subscribe({ ...emit, next })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
