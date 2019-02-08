import { Signal } from 'bulb'

export default function state (target, options) {
  options = options || { preventDefault: false }

  return new Signal(emit => {
    let state = new Set()

    const downHandler = e => {
      if (options.preventDefault) { e.preventDefault() }

      const key = parseInt(e.keyCode)

      if (!state.has(key)) {
        state.add(key)
        emit.next(Array.from(state))
      }
    }

    const upHandler = e => {
      if (options.preventDefault) { e.preventDefault() }

      const key = parseInt(e.keyCode)

      if (state.has(key)) {
        state.delete(key)
        emit.next(Array.from(state))
      }
    }

    target.addEventListener('keydown', downHandler, true)
    target.addEventListener('keyup', upHandler, true)

    return () => {
      target.removeEventListener('keydown', downHandler, true)
      target.removeEventListener('keyup', upHandler, true)
    }
  })
}
