import Signal from './signal'

/**
 * This module defines clock signals.
 *
 * @module bulb/clock
 * @summary Clock Signals
 */

/**
 * Returns a new clock signal that generates a "tick" event every `n`
 * milliseconds.
 *
 * @function
 * @summary Creates a clock signal.
 * @param n The number of milliseconds between each clock tick.
 * @returns A new signal.
 */
export const interval = n => new Signal(observer => {
  const id = setInterval(e => observer.next(n), n)
  return () => clearInterval(id)
})
