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

    const value = () => {
      if (buffer !== undefined) { emit.value(buffer) }
    }

    const subscriptions = [
      t.subscribe({ ...emit, value: a => { buffer = a } }),
      s.subscribe({ ...emit, value })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
