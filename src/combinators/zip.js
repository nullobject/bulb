import zipWith from './zipWith'

/**
 * Combines the corresponding values emitted by the signals `ss` into tuples.
 * The returned signal will complete when *any* of the given signals have
 * completed.
 *
 * @param {Array} ss The signals to zip.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, zip } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = Signal.fromArray([4, 5, 6])
 * const u = zip(s, t)
 *
 * u.subscribe(console.log) // [1, 4], [2, 5], [3, 6]
 */
export default function zip (...ss) {
  return zipWith((...as) => as, ss)
}
