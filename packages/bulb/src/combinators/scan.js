import { asap } from '../scheduler'

/**
 * Applies a reducer function `f` to each value emitted by the signal `s`. The
 * accumulated value will be emitted for each value emitted by the signal.
 *
 * @private
 */
export default function scan (f, a, s) {
  return emit => {
    let index = 0

    // Emit the starting value.
    asap(() => { emit.next(a) })

    const subscription = s.subscribe({
      ...emit,
      next (b) {
        a = f(a, b, index++)
        emit.next(a)
      }
    })

    return () => subscription.unsubscribe()
  }
}
