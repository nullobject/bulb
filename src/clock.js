const Signal = require('./signal')

/**
 * This module defines clock signals.
 *
 * @module bulb/clock
 * @summary Clock Signals
 */
module.exports = {
  /**
   * Returns a new clock signal that generates a "tick" event every `n`
   * milliseconds.
   *
   * @summary Creates a clock signal.
   * @param n The number of milliseconds between each clock tick.
   * @returns A new signal.
   */
  interval: n => new Signal(observer => {
    const id = setInterval(e => observer.next(n), n)
    return () => clearInterval(id)
  })
}
