import Signal from './signal'

/**
 * This module defines mouse signals.
 *
 * @module bulb/mouse
 * @summary Mouse Signals
 */

/**
 * Returns a new signal that generates an event when the mouse is moved.
 *
 * @function
 * @summary Creates a mouse position signal.
 * @param target The event target that the signal listens on.
 * @returns A new signal.
 */
export const position = target => new Signal(observer => {
  const moveHandler = e => observer.next([e.clientX, e.clientY])
  target.addEventListener('mousemove', moveHandler, true)
  return () => target.removeEventListener('mousemove', moveHandler, true)
})

/**
 * Returns a new signal that generates an event when a mouse button is
 * pressed.
 *
 * @function
 * @summary Creates a mouse button signal.
 * @param target The event target that the signal listens on.
 * @returns A new signal.
 */
export const button = target => new Signal(observer => {
  const downHandler = e => observer.next(true)
  const upHandler = e => observer.next(false)

  target.addEventListener('mousedown', downHandler, true)
  target.addEventListener('mouseup', upHandler, true)

  return () => {
    target.removeEventListener('mousedown', downHandler, true)
    target.removeEventListener('mouseup', upHandler, true)
  }
})
