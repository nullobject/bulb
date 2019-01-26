import Signal from '../Signal'

/**
 * Buffers values emitted by the signal `s` and emits the buffer contents when
 * it is full. The buffer contents will be emitted when the signal completes,
 * regardless of whether the buffer is full.
 *
 * @private
 */
export default function buffer (n = Infinity, s) {
  return new Signal(emit => {
    const buffer = []

    const flush = () => {
      const as = buffer.splice(0, n)
      if (as.length > 0) { emit.value(as) }
    }

    const value = a => {
      buffer.push(a)
      if (buffer.length === n) { flush() }
    }

    const complete = () => {
      flush()
      emit.complete()
    }

    const subscription = s.subscribe({ ...emit, value, complete })

    return () => subscription.unsubscribe()
  })
}
