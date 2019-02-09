import Signal from '../Signal'

/**
 * Waits until `n` milliseconds after the last burst of values before emitting
 * the most recent value from the signal `s`.
 *
 * @private
 */
export default function debounce (n, s) {
  return new Signal(emit => {
    let buffer
    let id

    const flush = () => {
      if (buffer) { emit.next(buffer) }
      buffer = null
    }

    const subscription = s.subscribe({ ...emit,
      next (a) {
        clearTimeout(id)
        buffer = a
        id = setTimeout(flush, n)
      },
      complete  () {
        clearTimeout(id)
        flush()
        emit.complete()
      }
    })

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  })
}
