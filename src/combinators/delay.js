import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Delays each value emitted by the signal `s` for `n` milliseconds.
 *
 * @param {Number} n The number of milliseconds to delay.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { delay, mousePosition } from 'bulb'
 *
 * const s = mousePosition(document)
 * const t = delay(1000, s)
 *
 * t.subscribe(console.log) // [1, 1], [2, 2], ...
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
