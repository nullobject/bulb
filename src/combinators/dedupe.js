import { eq } from 'fkit'

import { dedupeWith } from './dedupeWith'

/**
 * Removes duplicate values emitted by the signal `s`.
 *
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, dedupe } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 2, 3, 3, 3])
 * const t = dedupe(s)
 *
 * t.subscribe(console.log) // 1, 2, 3
 */
export default function dedupe (s) {
  return dedupeWith(eq, s)
}
