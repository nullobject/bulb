import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Delays the values emitted by the signal by `n` milliseconds.
 *
 * @param {Number} n The number of milliseconds to delay.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export function delay (n, s) {
  return new Signal(emit => {
    let id

    const value = a => {
      id = setTimeout(() => emit.value(a), n)
    }

    const subscription = s.subscribe({ ...emit, value })

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  })
}

export default curry(delay)
