import emitter from '../emitter'
import position from './position'

describe('position', () => {
  it('returns a new mouse position signal', () => {
    const spy = jest.fn()
    const e = emitter()
    const s = position(e)

    s.subscribe(spy)

    e.emit('mousemove', { clientX: 1, clientY: 2 })
    expect(spy).toHaveBeenCalledWith([1, 2])
  })

  describe('with the preventDefault option set', () => {
    it('calls preventDefault on the event', () => {
      const spy = jest.fn()
      const e = emitter()
      const s = position(e, { preventDefault: true })

      s.subscribe()

      e.emit('mousemove', { preventDefault: spy })
      expect(spy).toHaveBeenCalled()
    })
  })
})
