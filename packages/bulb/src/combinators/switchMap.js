/**
 * Applies a function `f` that returns a `Signal` to each value emitted by the
 * signal `s`. The returned signal will emit values from the most recent signal
 * returned by the function.
 *
 * @private
 */
export default function switchMap (f, s) {
  return emit => {
    let innerSubscription

    const outerSubscription = s.subscribe({
      ...emit,
      next (a) {
        const b = f(a)
        if (!(b && b.subscribe instanceof Function)) { throw new Error('Value must be a signal') }
        if (innerSubscription) { innerSubscription.unsubscribe() }
        innerSubscription = b.subscribe({ ...emit, complete: undefined })
      }
    })

    return () => {
      if (innerSubscription) { innerSubscription.unsubscribe() }
      outerSubscription.unsubscribe()
    }
  }
}
