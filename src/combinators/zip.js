import zipWith from './zipWith'

/**
 * Combines corresponding values from the signals `ss`. The resulting signal
 * emits tuples of corresponding values.
 *
 * The signal completes when *any* of the zipped signals have completed.
 *
 * @param {Array} ss An array of signals.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = Signal.fromArray([4, 5, 6])
 *
 * // A signal that emits tuples of corresponding values.
 * // e.g. [1, 4], [2, 5], [3, 6]
 * zip(s, t)
 */
export default function zip (...ss) {
  return zipWith((...as) => as, ss)
}
