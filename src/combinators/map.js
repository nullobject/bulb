import { compose, curry } from 'fkit'

import Signal from '../Signal'

/**
 * Maps a function `f` over a signal.
 *
 * @param {Function} f A function that returns a value.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 3])
 *
 * // A signal that increments the values emitted by the given signal.
 * // e.g. 2, 3, 4
 * map(a => a + 1, s)
 */
export function map (f, s) {
  return new Signal(emit => {
    const value = compose(emit.value, f)
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}

export default curry(map)
