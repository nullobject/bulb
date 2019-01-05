import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Debounces a signal to only emit a value `n` milliseconds after the last
 * burst of events.
 *
 * @param {Number} n The number of milliseconds to delay.
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export function debounce (n, s) {
  return new Signal(emit => {
    let buffer
    let id

    const emitLastValue = (emit) => {
      if (buffer) { emit.value(buffer) }
      buffer = null
    }

    const value = a => {
      clearTimeout(id)
      buffer = a
      id = setTimeout(() => emitLastValue(emit), n)
    }

    const complete = () => {
      clearTimeout(id)
      emitLastValue(emit)
      emit.complete()
    }

    const subscription = s.subscribe({ ...emit, value, complete })

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  })
}

export default curry(debounce)
