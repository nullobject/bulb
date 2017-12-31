import Signal from './signal'

/**
 * This module defines mouse signals.
 *
 * @module mouse
 * @summary Mouse Signals
 */

/**
 * Creates a signal that emits a value if the mouse state changes.
 *
 * When the mouse is moved or a button is pressed, then the signal will emit
 * an object representing the current state of the mouse.
 *
 * @summary Creates a mouse state signal.
 * @param target A DOM element.
 * @returns A new signal.
 */
export function state (target) {
  return new Signal(emit => {
    const handler = e => {
      emit.next({
        buttons: e.buttons,
        x: e.clientX,
        y: e.clientY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey
      })
    }

    target.addEventListener('mousemove', handler, true)
    target.addEventListener('mousedown', handler, true)
    target.addEventListener('mouseup', handler, true)

    return () => {
      target.removeEventListener('mousemove', handler, true)
      target.removeEventListener('mousedown', handler, true)
      target.removeEventListener('mouseup', handler, true)
    }
  })
}

/**
 * Creates a signal that emits a value if the mouse is moved.
 *
 * When the mouse is moved, then the signal will emit an array containing the
 * mouse position.
 *
 * @summary Creates a mouse position signal.
 * @param target The event target that the signal listens on.
 * @returns A new signal.
 */
export function position (target) {
  return new Signal(emit => {
    const handler = e => emit.next([e.clientX, e.clientY])
    target.addEventListener('mousemove', handler, true)
    return () => target.removeEventListener('mousemove', handler, true)
  })
}

/**
 * Creates a signal that emits a value if a mouse button is pressed.
 *
 * When a mouse button is pressed, then the signal will emit an integer
 * representing the logical sum of the currently pressed button codes (left=1,
 * right=2, middle=4).
 *
 * @summary Creates a mouse button signal.
 * @param target A DOM element.
 * @returns A new signal.
 */
export function button (target) {
  return new Signal(emit => {
    const handler = e => emit.next(e.buttons)
    target.addEventListener('mousedown', handler, true)
    return () => target.removeEventListener('mousedown', handler, true)
  })
}
