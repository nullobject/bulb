import Signal from '../Signal'

/**
 * Merges the given signals `ss` and emits their values. The returned signal
 * will complete once *all* of the given signals have completed.
 *
 * @param {Array} ss The signals to merge.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, merge } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = Signal.fromArray([4, 5, 6])
 * const u = merge(s, t)
 *
 * u.subscribe(console.log) // 1, 4, 2, 5, 3, 6
 */
export default function merge (...ss) {
  // Allow the signals to be given as an array.
  if (ss.length === 1 && Array.isArray(ss[0])) {
    ss = ss[0]
  }

  return new Signal(emit => {
    let numComplete = 0

    const complete = () => {
      if (++numComplete >= ss.length) { emit.complete() }
    }

    // Emit values from any signal.
    const subscriptions = ss.map(s => s.subscribe({ ...emit, complete }))

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
