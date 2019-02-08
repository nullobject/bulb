import Signal from '../Signal'

/**
 * Replaces the values of the signal `s` with a constant `c`.
 *
 * @private
 */
export default function always (c, s) {
  return new Signal(emit => {
    const subscription = s.subscribe({ ...emit,
      next () { emit.next(c) }
    })

    return () => subscription.unsubscribe()
  })
}
