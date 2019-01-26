import { Signal } from 'bulb'

export default function buttons (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.value(e.buttons)
    }

    target.addEventListener('mousedown', handler, true)

    return () => target.removeEventListener('mousedown', handler, true)
  })
}
