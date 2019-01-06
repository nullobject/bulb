import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Samples events from the target signal `t` whenever there is an event on the
 * control signal `s`.
 *
 * @param {Signal} s The control signal.
 * @param {Signal} t The target signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.periodic(1000)
 * const t = mousePosition()
 *
 * // A signal that samples the mouse position every second.
 * sample(s, t)
 */
export function sample (s, t) {
  return new Signal(emit => {
    let buffer

    const value = () => {
      // Emit the buffered value.
      if (buffer !== undefined) { emit.value(buffer) }
    }

    const subscriptions = [
      s.subscribe({ ...emit, value }),

      // Buffer the last value.
      t.subscribe(a => { buffer = a }, emit.error, emit.complete)
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

export default curry(sample)
