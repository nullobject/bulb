import Signal from '../Signal'

/**
 * Creates a signal that emits a value if the mouse state changes.
 *
 * When the mouse is moved or a button is pressed, then the signal will emit
 * an object representing the current state of the mouse.
 *
 * @param {EventTarget} target The event target (e.g. a DOM element).
 * @param {Object} [options] The options.
 * @param {Booelan} [options.preventDefault=false] A boolean indicating whether
 * the default action should be taken for the event.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { mousePosition } from 'bulb'
 *
 * const s = mousePosition(document)
 *
 * s.subscribe(console.log) // { buttons: 1, x: 1, y: 1, ... }, { buttons: 2, x: 2, y: 2, ... }
 */
export default function mouseState (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }

      emit.value({
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
