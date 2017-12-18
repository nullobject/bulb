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
 * @summary Creates a mouse position signal.
 * @param target The event target that the signal listens on.
 * @returns A new signal.
 */
export function position (target) {
  return new Signal(emit => {
    const moveHandler = e => emit.next([e.clientX, e.clientY])
    target.addEventListener('mousemove', moveHandler, true)
    return () => target.removeEventListener('mousemove', moveHandler, true)
  })
}

/**
 * Returns a new signal that generates an event when a mouse button is
 * pressed.
 *
 * @summary Creates a mouse button signal.
 * @param target The event target that the signal listens on.
 * @returns A new signal.
 */
export function button (target) {
  return new Signal(emit => {
    const downHandler = e => emit.next(true)
    const upHandler = e => emit.next(false)

    target.addEventListener('mousedown', downHandler, true)
    target.addEventListener('mouseup', upHandler, true)

    return () => {
      target.removeEventListener('mousedown', downHandler, true)
      target.removeEventListener('mouseup', upHandler, true)
    }
  })
}
