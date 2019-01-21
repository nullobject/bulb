import zipWith from './zipWith'

export function tuple (...as) {
  return as
}

/**
 * Combines the corresponding values emitted by the signals `ss` into tuples.
 * The returned signal will complete when *any* of the given signals have
 * completed.
 *
 * @private
 */
export default function zip (ss) {
  return zipWith(tuple, ss)
}
