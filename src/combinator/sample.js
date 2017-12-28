import Signal from '../signal'

/**
 * This module defines sample combinators for signals.
 *
 * @private
 * @module bulb/combinator/sample
 * @author Josh Bassett
 */

/**
 * Emits the most recent value from signal `t` whenever there is an event on
 * the sampler signal `s`.
 *
 * @param s A signal.
 * @param t A signal.
 * @returns A new signal.
 */
export function sample (s, t) {
  let buffer

  return new Signal(emit => {
    const next = () => {
      // Emit the buffered value.
      if (buffer !== undefined) { emit.next(buffer) }
    }

    const subscriptions = [
      s.subscribe({...emit, next}),

      // Buffer the last value.
      t.subscribe(a => { buffer = a }, emit.error, emit.complete)
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

/**
 * Pauses emitting events from signal `t` if the most recent value from the
 * hold signal `s` is truthy.
 *
 * It will resume emitting events after there is a falsey value.
 *
 * @param s A signal.
 * @returns A new signal.
 */
export function hold (s, t) {
  let hold

  return new Signal(emit => {
    const next = a => {
      // Emit the value if the hold is open.
      if (!hold) { emit.next(a) }
    }

    const subscriptions = [
      t.subscribe({...emit, next}),

      // Set the hold value.
      s.subscribe(a => { hold = a }, emit.error, emit.complete)
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
