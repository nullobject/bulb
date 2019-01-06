import { eq } from 'fkit'

import dedupeWith from './dedupeWith'

/**
 * Removes duplicate values from a signal.
 *
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 2, 3, 3, 3])
 *
 * // A signal with duplicates removed.
 * // e.g. 1, 2, 3
 * dedupe(s)
 */
export default function dedupe (s) {
  return dedupeWith(eq, s)
}
