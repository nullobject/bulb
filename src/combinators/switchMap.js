import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Applies a function `f`, which returns a `Signal`, to each value emitted by
 * the signal `s`. The returned signal will emit values from the most recent
 * signal returned by the function.
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
    let subscription2

    const value = a => {
      if (subscription2) { subscription2.unsubscribe() }
      subscription2 = f(a).subscribe({ ...emit, complete: null })
    }

    const subscription1 = s.subscribe({ ...emit, value })

    return () => {
      subscription1.unsubscribe()
      if (subscription2) { subscription2.unsubscribe() }
    }
  })
}

export default curry(switchMap)
