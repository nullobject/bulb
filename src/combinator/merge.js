import Signal from '../signal'

/**
 * This module defines merge combinators for signals.
 *
 * @private
 * @module combinator/merge
 */

/**
 * Merges the given signals into a new signal.
 *
 * The signal completes when *all* of the input signals have completed.
 *
 * @param ss A list of signals.
 * @returns A new signal.
 */
export function merge (...ss) {
  // Allow the signals to be given as an array.
  if (ss.length === 1 && Array.isArray(ss[0])) {
    ss = ss[0]
  }

  let numComplete = 0

  return new Signal(emit => {
    const complete = () => {
      if (++numComplete >= ss.length) { emit.complete() }
    }

    // Emit values from any signal.
    const subscriptions = ss.map(s => s.subscribe({...emit, complete}))

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
