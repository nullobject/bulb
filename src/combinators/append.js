import { curry } from 'fkit'

import Signal from '../Signal'
import concat from './concat'

/**
 * Emits a value `a` after the signal `s` has completed.
 *
 * @param a The value to append.
 * @param s {Signal} The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, append } from 'bulb'
 *
 * const s = Signal.fromArray[1, 2, 3]
 * const t = append(4, s)
 *
 * t.subscribe(console.log) // 1, 2, 3, 4
 */
export function append (a, s) {
  return concat(s, Signal.of(a))
}

export default curry(append)
