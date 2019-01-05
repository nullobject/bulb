import emitter from '../emitter'
import state from './state'

describe('state', () => {
  it('returns a new mouse position signal', () => {
    const spy = jest.fn()
    const e = emitter()
    const s = state(e)

    s.subscribe(spy)

    e.emit('mousemove', {
      buttons: 0,
      clientX: 1,
      clientY: 2,
      ctrlKey: 3,
      shiftKey: 4,
      altKey: 5,
      metaKey: 6
    })

    expect(spy).toHaveBeenCalledWith({
      buttons: 0,
      x: 1,
      y: 2,
      ctrlKey: 3,
      shiftKey: 4,
      altKey: 5,
      metaKey: 6
    })
  })

  describe('with the preventDefault option set', () => {
    it('calls preventDefault on the event', () => {
      const spy = jest.fn()
      const e = emitter()
      const s = state(e, { preventDefault: true })

      s.subscribe()

      e.emit('mousedown', { preventDefault: spy })
      expect(spy).toHaveBeenCalled()
    })
  })
})
