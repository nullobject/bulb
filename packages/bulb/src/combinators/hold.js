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

    const subscriptions = [
      s.subscribe({ ...emit,
        next (a) { enabled = !a }
      }),
      t.subscribe({ ...emit,
        next (a) {
          if (enabled) { emit.next(a) }
        }
      })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
