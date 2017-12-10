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
    const moveHandler = e => next([e.clientX, e.clientY])
    target.addEventListener('mousemove', moveHandler, true)
    return () => target.removeEventListener('mousemove', moveHandler, true)
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
    const downHandler = e => next(true)
    const upHandler = e => next(false)

    target.addEventListener('mousedown', downHandler, true)
    target.addEventListener('mouseup', upHandler, true)

    return () => {
      target.removeEventListener('mousedown', downHandler, true)
      target.removeEventListener('mouseup', upHandler, true)
    }
  })
}
