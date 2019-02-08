import Signal from '../Signal'

/**
 * Applies a function `f`, that returns a `Signal`, to each value emitted by
 * the signal `s`. The returned signal will emit values from the most recent
 * signal returned by the function.
 *
 * @private
 */
export default function switchMap (f, s) {
  return new Signal(emit => {
    let innerSubscription

    const next = a => {
      const b = f(a)
      if (!(b instanceof Signal)) {
        throw new Error('Signal value must be a signal')
      }
      if (innerSubscription) { innerSubscription.unsubscribe() }
      innerSubscription = b.subscribe({ ...emit, complete: null })
    }

    const outerSubscription = s.subscribe({ ...emit, next })

    return () => {
      if (innerSubscription) { innerSubscription.unsubscribe() }
      outerSubscription.unsubscribe()
    }
  })
}
