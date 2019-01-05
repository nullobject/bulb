import buttons from './buttons'
import emitter from '../emitter'

describe('buttons', () => {
  it('returns a new mouse buttons signal', () => {
    const spy = jest.fn()
    const e = emitter()
    const s = buttons(e)

    s.subscribe(spy)

    e.emit('mousedown', { buttons: 1 })
    expect(spy).toHaveBeenCalledWith(1)
  })

  describe('with the preventDefault option set', () => {
    it('calls preventDefault on the event', () => {
      const spy = jest.fn()
      const e = emitter()
      const s = buttons(e, { preventDefault: true })

      s.subscribe()

      e.emit('mousedown', { preventDefault: spy })
      expect(spy).toHaveBeenCalled()
    })
  })
})
