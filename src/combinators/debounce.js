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
      if (buffer) { emit.value(buffer) }
      buffer = null
    }

    const value = a => {
      clearTimeout(id)
      buffer = a
      id = setTimeout(flush, n)
    }

    const complete = () => {
      clearTimeout(id)
      flush()
      emit.complete()
    }

    const subscription = s.subscribe({ ...emit, value, complete })

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  })
}
