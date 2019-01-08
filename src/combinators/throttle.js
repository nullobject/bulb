import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Limits the rate at which values are emitted by the signal `s`. Values are
 * dropped when the rate limit is exceeded.
 *
 * @param {Number} n The number of milliseconds to wait between emitted values.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { mousePosition, throttle } from 'bulb'
 *
 * const s = mousePosition(document)
 * const t = throttle(1000, s)
 *
 * t.subscribe(console.log) // [1, 1], [2, 2], ...
 */
export function throttle (n, s) {
  return new Signal(emit => {
    let lastTime = null

    const value = a => {
      const t = Date.now()
      if (lastTime === null || t - lastTime >= n) {
        emit.value(a)
        lastTime = t
      }
    }

    const subscription = s.subscribe({ ...emit, value })

    return () => subscription.unsubscribe()
  })
}

export default curry(throttle)
