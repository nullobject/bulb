import { curry } from 'fkit'

import Signal from '../Signal'
import concat from './concat'

/**
 * Emits the values from an array `as` after the signal `s` has completed.
 *
 * @param as The value to append.
 * @param s {Signal} The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, append } from 'bulb'
 *
 * const s = Signal.fromArray[1, 2, 3]
 * const t = append([4, 5, 6], s)
 *
 * t.subscribe(console.log) // 1, 2, 3, 4, 5, 6
 */
export function append (as, s) {
  return concat(s, Signal.fromArray(as))
}

export default curry(append)
