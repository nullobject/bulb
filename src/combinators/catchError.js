import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Applies a function `f`, that returns a `Signal`, to the first error emitted
 * by the signal `s`. The returned signal will emit values from the signal
 * returned by the function.
 *
 * @param {Function} f The function to apply to the first error emitted by the
 * signal. It must also return a `Signal`.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, catchError } from 'bulb'
 *
 * const s = Signal.throwError()
 * const t = catchError(e => Signal.of(1), s)
 *
 * t.subscribe(console.log) // 1
 */
export function catchError (f, s) {
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

export default curry(catchError)
