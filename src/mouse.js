const Signal = require('./signal')

/**
 * This module defines mouse signals.
 *
 * @module bulb/mouse
 * @summary Mouse Signals
 */
module.exports = {
  /**
   * Returns a new signal that generates an event when the mouse is moved.
   *
   * @summary Creates a mouse position signal.
   * @param target The event target that the signal listens on.
   * @returns A new signal.
   */
  position: target => new Signal(next => {
    target.addEventListener('mousemove', e => next([e.clientX, e.clientY]))
  }),

  /**
   * Returns a new signal that generates an event when a mouse button is
   * pressed.
   *
   * @summary Creates a mouse button signal.
   * @param target The event target that the signal listens on.
   * @returns A new signal.
   */
  button: target => new Signal(next => {
    target.addEventListener('mousedown', e => next(true))
    target.addEventListener('mouseup', e => next(false))
  })
}
