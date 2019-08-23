/**
 * Emits the most recent value from the target signal `t` whenever the control
 * signal `s` emits a value.
 *
 * @private
 */
export default function sample (s, t) {
  return emit => {
    let buffer

    const subscriptions = [
      t.subscribe({ ...emit, next (a) { buffer = a } }),
      s.subscribe({
        ...emit,
        next (a) { if (buffer !== undefined) { emit.next(buffer) } }
      })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  }
}
