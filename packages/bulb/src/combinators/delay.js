import Signal from '../Signal'

/**
 * Delays each value emitted by the signal `s` for `n` milliseconds.
 *
 * @private
 */
export default function delay (n, s) {
  return new Signal(emit => {
    let id

    const subscription = s.subscribe({ ...emit,
      next (a) { id = setTimeout(() => emit.next(a), n) }
    })

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  })
}
