import { Signal } from 'bulb'

export default function state (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.value(e)
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
