import { curry } from 'fkit'

import Signal from '../Signal'
import concat from './concat'

/**
 * Emits a value `a` before any other values are emitted by the signal `s`.
 *
 * @param a The value to emit last.
 * @param s {Signal} The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, endWith } from 'bulb'
 *
 * const s = Signal.fromArray[1, 2, 3]
 * const t = endWith(4, s)
 *
 * t.subscribe(console.log) // 1, 2, 3, 4
 */
export function endWith (a, s) {
  return concat(s, Signal.of(a))
}

export default curry(endWith)
