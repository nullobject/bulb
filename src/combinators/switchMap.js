import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Applies a function `f` that returns a `Signal`, to each value emitted by the
 * signal `s`. The returned signal will emit values from the most recent signal
 * returned by the function.
 *
 * @param {Function} f The function to apply to each value emitted by the
 * signal. It must also return a `Signal`.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, switchMap } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = switchMap(a => Signal.of(a + 1), s)
 *
 * t.subscribe(console.log) // 2, 3, 4
 */
export function switchMap (f, s) {
  return new Signal(emit => {
    let innerSubscription

    const value = a => {
      const b = f(a)
      if (!(b instanceof Signal)) {
        throw new Error('Signal value must be a signal')
      }
      if (innerSubscription) { innerSubscription.unsubscribe() }
      innerSubscription = b.subscribe({ ...emit, complete: null })
    }

    const outerSubscription = s.subscribe({ ...emit, value })

    return () => {
      if (innerSubscription) { innerSubscription.unsubscribe() }
      outerSubscription.unsubscribe()
    }
  })
}

export default curry(switchMap)
