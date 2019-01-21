import Signal from '../Signal'

/**
 * Applies a function `f`, that returns a `Signal`, to the first error emitted
 * by the signal `s`. The returned signal will emit values from the signal
 * returned by the function.
 *
 * @private
 */
export default function catchError (f, s) {
  return new Signal(emit => {
    let outerSubscription
    let innerSubscription

    const error = e => {
      outerSubscription.unsubscribe()
      outerSubscription = null
      const a = f(e)
      if (!(a instanceof Signal)) {
        throw new Error('Signal value must be a signal')
      }
      innerSubscription = a.subscribe({ ...emit })
    }

    outerSubscription = s.subscribe({ ...emit, error })

    return () => {
      if (innerSubscription) { innerSubscription.unsubscribe() }
      if (outerSubscription) { outerSubscription.unsubscribe() }
    }
  })
}
