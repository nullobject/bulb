import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * This module defines delay combinators for signals.
 *
 * @private
 * @module combinators/delay
 */

/**
 * Delays events emitted by the signal `s` for `n` milliseconds.
 *
 * @curried
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

    const subscription = s.subscribe({ ...emit, next, complete })

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  })
})

/**
 * Debounces the signal `s` to only emit an event `n` milliseconds after the
 * last burst of events.
 *
 * @curried
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

    const subscription = s.subscribe({ ...emit, next, complete })

    return () => {
      clearTimeout(id)
      subscription.unsubscribe()
    }
  })
})

/**
 * Limits the rate of events emitted by the signal `s` to allow at most one
 * event every `n` milliseconds.
 *
 * @curried
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

    const subscription = s.subscribe({ ...emit, next })

    return () => subscription.unsubscribe()
  })
})
