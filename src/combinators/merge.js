import Signal from '../Signal'

/**
 * Merges the signals `ss`.
 *
 * The signal completes when *all* of the merged signals have completed.
 *
 * @param {Array} ss An array of signals.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = Signal.fromArray([4, 5, 6])
 *
 * // A signal that emits the values from the merged signals.
 * merge(s, t)
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
