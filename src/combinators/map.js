import { compose, curry } from 'fkit'

import Signal from '../Signal'

/**
 * Applies a function `f` to each value emitted by the signal `s`.
 *
 * @param {Function} f The function to apply to each value emitted by the
 * signal.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, map } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = map(a => a + 1, s)
 *
 * t.subscribe(console.log) // 2, 3, 4
 */
export function map (f, s) {
  return new Signal(emit => {
    const value = compose(emit.value, f)
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}

export default curry(map)
