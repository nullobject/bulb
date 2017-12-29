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
 * Delays events emitted by the signal `s` for `n` milliseconds.
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
 * Debounces the signal `s` to only emit an event `n` milliseconds after the
 * last burst of events.
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

/**
 * Limits the rate of events emitted by the signal `s` to allow at most one
 * event every `n` milliseconds.
 *
 * @function
 * @param n A number.
 * @param s A signal.
 * @returns A new signal.
 */
export const throttle = curry((n, s) => {
  let lastTime

  return new Signal(emit => {
    const next = a => {
      const t = Date.now()
      if (!lastTime || t - lastTime >= n) {
        emit.next(a)
        lastTime = t
      }
    }

    s.subscribe({...emit, next})
  })
})
