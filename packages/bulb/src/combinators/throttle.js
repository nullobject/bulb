import Signal from '../Signal'

/**
 * Limits the rate at which values are emitted by the signal `s`. Values are
 * dropped when the rate limit is exceeded.
 *
 * @private
 */
export default function throttle (n, s) {
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