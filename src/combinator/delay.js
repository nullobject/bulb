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
