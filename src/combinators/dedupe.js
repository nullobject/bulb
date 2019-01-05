import { eq } from 'fkit'

import dedupeWith from './dedupeWith'

/**
 * Removes duplicate values from a signal.
 *
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export default function dedupe (s) {
  return dedupeWith(eq, s)
}
