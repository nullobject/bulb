import { Signal } from 'bulb'

export default function position (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    const handler = e => {
      if (options.preventDefault) { e.preventDefault() }
      emit.next([e.clientX, e.clientY])
    }

    target.addEventListener('mousemove', handler, true)

    return () => target.removeEventListener('mousemove', handler, true)
  })
}
