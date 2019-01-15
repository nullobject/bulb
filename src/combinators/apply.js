import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Applies the latest function emitted by the signal `s` to latest value
 * emitted by the signal `t`. The returned signal will complete when either of
 * the given signals have completed.
 *
 * @param {Signal} s The signal of functions.
 * @param {Signal} t The signal of values.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, apply } from 'bulb'
 *
 * const s = Signal.fromArray([a => a + 1])
 * const t = Signal.fromArray([1, 2, 3])
 * const u = apply(s, t)
 *
 * u.subscribe(console.log) // 2, 3, 4
 */
export function apply (s, t) {
  return new Signal(emit => {
    let functionBuffer, valueBuffer

    const functionHandler = a => {
      functionBuffer = a
      if (functionBuffer && valueBuffer) {
        emit.value(functionBuffer(valueBuffer))
      }
    }

    const valueHandler = a => {
      valueBuffer = a
      if (functionBuffer && valueBuffer) {
        emit.value(functionBuffer(valueBuffer))
      }
    }

    const subscriptions = [
      s.subscribe({ ...emit, value: functionHandler }),
      t.subscribe({ ...emit, value: valueHandler })
    ]

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}

export default curry(apply)
