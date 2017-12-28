import Signal from '../signal'
import {compose, curry} from 'fkit'

/**
 * This module defines map combinators for signals.
 *
 * @private
 * @module bulb/combinator/map
 * @author Josh Bassett
 */

/**
 * Applies the function `f` to the signal `s`. The function `f` must also
 * return a `Signal`.
 *
 * @function
 * @param f A unary function.
 * @param s A signal.
 * @returns A new signal.
 */
export const concatMap = curry((f, s) => {
  let subscription2

  return new Signal(emit => {
    const next = a => {
      if (subscription2) { subscription2.unsubscribe() }
      subscription2 = f(a).subscribe(emit)
    }

    const subscription1 = s.subscribe({...emit, next})

    return () => {
      subscription1.unsubscribe()
      if (subscription2) { subscription2.unsubscribe() }
    }
  })
})

/**
 * Applies the function `f` to the signal `s`. The function must return a
 * signal value.
 *
 * @function
 * @param f A unary function.
 * @param s A signal.
 * @returns A new signal.
 */
export const map = curry((f, s) => {
  return new Signal(emit => {
    const next = compose(emit.next, f)
    s.subscribe({...emit, next})
  })
})
