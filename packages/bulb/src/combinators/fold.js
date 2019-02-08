import Signal from '../Signal'

/**
 * Applies an accumulator function `f` to each value emitted by the signal `s`.
 * The accumulated value will be emitted when the signal has completed.
 *
 * @private
 */
export default function fold (f, a, s) {
  return new Signal(emit => {
    let index = 0

    const subscription = s.subscribe({ ...emit,
      next (b) { a = f(a, b, index++) },
      complete () {
        // Emit the final value.
        emit.next(a)
        emit.complete()
      }
    })

    return () => subscription.unsubscribe()
  })
}
