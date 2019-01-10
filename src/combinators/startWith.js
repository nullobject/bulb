import { curry } from 'fkit'

import Signal from '../Signal'
import concat from './concat'

/**
 * Emits a value `a` before any other values are emitted by the signal `s`.
 *
 * @param a The value to emit first.
 * @param s {Signal} The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, startWith } from 'bulb'
 *
 * const s = Signal.fromArray[1, 2, 3]
 * const t = startWith(0, s)
 *
 * t.subscribe(console.log) // 0, 1, 2, 3
 */
export function startWith (a, s) {
  return concat(Signal.of(a), s)
}

export default curry(startWith)
