import Signal from '../Signal'

/**
 * Delays each value emitted by the signal `s` for `n` milliseconds.
 *
 * @private
 */
export default function delay (n, s) {
  return new Signal(emit => {
    let id

    const value = a => {
      id = setTimeout(() => emit.value(a), n)
    }

    const subscription = s.subscribe({ ...emit, value })

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  })
}
