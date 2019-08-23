/**
 * Applies a function `f`, that returns a `Signal`, to the first error emitted
 * by the signal `s`. The returned signal will emit values from the signal
 * returned by the function.
 *
 * @private
 */
export default function catchError (f, s) {
  return emit => {
    let outerSubscription
    let innerSubscription

    outerSubscription = s.subscribe({
      ...emit,
      error (e) {
        outerSubscription.unsubscribe()
        outerSubscription = null
        const a = f(e)
        if (!(a && a.subscribe instanceof Function)) { throw new Error('Value must be a signal') }
        innerSubscription = a.subscribe({ ...emit })
      }
    })

    return () => {
      if (innerSubscription) { innerSubscription.unsubscribe() }
      if (outerSubscription) { outerSubscription.unsubscribe() }
    }
  }
}
