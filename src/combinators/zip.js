import Signal from '../signal'
import {all, replicate} from 'fkit'

/**
 * This module defines zip combinators for signals.
 *
 * @private
 * @module combinators/zip
 */

/**
 * Combines corresponding values from the given signals into tuples.
 *
 * The signal completes when *any* of the input signals have completed.
 *
 * @param s A signal.
 * @returns A new signal.
 */
export function zip (...ss) {
  return zipWith((...as) => as, ss)
}

/**
 * Generalises the `zip` function to combine corresponding values from the
 * given signals using the function `f`.
 *
 * The signal completes when *any* of the input signals have completed.
 *
 * @param f A function.
 * @param ss A list of signals.
 * @returns A new signal.
 */
export function zipWith (f, ...ss) {
  // Allow the signals to be given as an array.
  if (ss.length === 1 && Array.isArray(ss[0])) {
    ss = ss[0]
  }

  const buffers = replicate(ss.length, [])

  return new Signal(emit => {
    const next = (a, index) => {
      // Buffer the value.
      buffers[index].push(a)

      // Check if each of the signals have at least one buffered value.
      if (all(buffer => buffer.length > 0, buffers)) {
        // Get the next buffered value for each of the signals.
        const as = buffers.reduce((as, buffer) => {
          as.push(buffer.shift())
          return as
        }, [])

        // Emit the value.
        emit.next(f(...as))
      }
    }

    const subscriptions = ss.map((s, i) =>
      s.subscribe(a => next(a, i), emit.error, emit.complete)
    )

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
