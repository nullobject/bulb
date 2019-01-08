import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Waits until `n` milliseconds after the last burst of values before emitting
 * the most recent value from the signal `s`.
 *
 * @param {Number} n The number of milliseconds to wait.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { debounce, mousePosition } from 'bulb'
 *
 * const s = mousePosition(document)
 * const t = debounce(1000, s)
 *
 * t.subscribe(console.log) // [1, 1], [2, 2], ...
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
