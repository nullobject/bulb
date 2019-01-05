import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Emits the most recent value from signal `t` whenever there is an event on
 * the sampler signal `s`.
 *
 * @param {Signal} s A signal.
 * @param {Signal} t A signal.
 * @returns {Signal} A new signal.
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
