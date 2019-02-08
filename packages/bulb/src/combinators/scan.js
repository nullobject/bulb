import Signal from '../Signal'
import { asap } from '../scheduler'

/**
 * Applies an accumulator function `f` to each value emitted by the signal `s`.
 * The accumulated value will be emitted for each value emitted by the signal.
 *
 * @private
 */
export default function scan (f, a, s) {
  return new Signal(emit => {
    let index = 0

    // Emit the starting value.
    asap(() => { emit.next(a) })

    const next = b => {
      // Fold the current value with the previous value.
      a = f(a, b, index++)

      // Emit the accumulated value.
      emit.next(a)
    }

    const subscription = s.subscribe({ ...emit, next })

    return () => subscription.unsubscribe()
  })
}
