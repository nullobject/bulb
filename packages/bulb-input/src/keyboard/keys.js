import { Signal } from 'bulb'

export default function keys (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.value(parseInt(e.keyCode))
    }

    target.addEventListener('keydown', handler, true)

    return () => target.removeEventListener('keydown', handler, true)
  })
}
