import { curry } from 'fkit'

import Signal from '../Signal'
import concat from './concat'

/**
 * Emits the values from an array `as` before any other values are emitted by
 * the signal `s`.
 *
 * @param {Array} as The values to prepend.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, prepend } from 'bulb'
 *
 * const s = Signal.fromArray[1, 2, 3]
 * const t = prepend([4, 5, 6], s)
 *
 * t.subscribe(console.log) // 4, 5, 6, 1, 2, 3
 */
export function prepend (as, s) {
  return concat(Signal.fromArray(as), s)
}

export default curry(prepend)
