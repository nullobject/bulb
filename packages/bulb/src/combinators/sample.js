import Signal from '../Signal'

/**
 * Emits the most recent value from the target signal `t` whenever the control
 * signal `s` emits a value.
 *
 * @private
 */
export default function sample (s, t) {
  return new Signal(emit => {
    let buffer

    const next = () => {
      if (buffer !== undefined) { emit.next(buffer) }
    }

    const subscriptions = [
      t.subscribe({ ...emit, next: a => { buffer = a } }),
      s.subscribe({ ...emit, next })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
