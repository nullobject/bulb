import Signal from '../signal'
import {curry} from 'fkit'

/**
 * This module defines delay combinators for signals.
 *
 * @private
 * @module bulb/combinator/delay
 * @author Josh Bassett
 */

/**
 * Delays the signal `s` by `n` milliseconds.
 *
 * @function
 * @param n A number.
 * @param s A signal.
 * @returns A new signal.
 */
export const delay = curry((n, s) => {
  let id

  return new Signal(emit => {
    const next = a => {
      id = setTimeout(() => emit.next(a), n)
    }

    const complete = () => {
      setTimeout(() => emit.complete(), n)
    }

    s.subscribe({...emit, next, complete})

    return () => clearTimeout(id)
  })
})

/**
 * Debounces the signal `s` by `n` milliseconds.
 *
 * The last event in a burst of events will be emitted `n` milliseconds later.
 *
 * @function
 * @param n A number.
 * @param s A signal.
 * @returns A new signal.
 */
export const debounce = curry((n, s) => {
  let value
  let id

  const emitLastValue = (emit) => {
    if (value) { emit.next(value) }
    value = null
  }

  return new Signal(emit => {
    const next = a => {
      clearTimeout(id)
      value = a
      id = setTimeout(() => emitLastValue(emit), n)
    }

    const complete = () => {
      clearTimeout(id)
      emitLastValue(emit)
      emit.complete()
    }

    s.subscribe({...emit, next, complete})

    return () => clearTimeout(id)
  })
})
