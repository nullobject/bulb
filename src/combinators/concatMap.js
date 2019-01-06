import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Maps a function `f` over a signal. The function must also return a `Signal`.
 *
 * @param {Function} f A function that returns a signal.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 3])
 *
 * // A signal that emits the values emitted by the returned signals.
 * // e.g. 2, 3, 4
 * concatMap(a => Signal.of(a + 1), s)
 */
export function concatMap (f, s) {
  return new Signal(emit => {
    let subscription2

    const value = a => {
      if (subscription2) { subscription2.unsubscribe() }
      subscription2 = f(a).subscribe(emit)
    }

    const subscription1 = s.subscribe({ ...emit, value })

    return () => {
      subscription1.unsubscribe()
      if (subscription2) { subscription2.unsubscribe() }
    }
  })
}

export default curry(concatMap)
