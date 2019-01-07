import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Limits the rate at which values are emitted by a signal.
 *
 * @param {Number} n The number of milliseconds between emitted values.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
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
