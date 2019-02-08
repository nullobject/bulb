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

    // Fold the current value with the previous value.
    const next = b => { a = f(a, b, index++) }

    const complete = () => {
      // Emit the final value.
      emit.next(a)
      emit.complete()
    }

    const subscription = s.subscribe({ ...emit, next, complete })

    return () => subscription.unsubscribe()
  })
}
