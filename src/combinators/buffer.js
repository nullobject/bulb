import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Buffers values emitted by the signal `s` and emits the buffer contents when
 * it is full. The buffer contents will be emitted when the signal completes,
 * regardless of whether the buffer is full.
 *
 * @param {Number} [n=Infinity] The size of the buffer. If the size is set to
 * `Infinity`, then the signal will be buffered until it completes.
 * @param {Signal} s The signal to buffer.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, buffer } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3, 4])
 * const t = buffer(2, s)
 *
 * u.subscribe(console.log) // [1, 2], [2, 4], ...
 */
export function buffer (n = Infinity, s) {
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

export default curry(buffer)
