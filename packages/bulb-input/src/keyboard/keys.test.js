import emitter from '../internal/emitter'
import keys from './keys'

describe('keys', () => {
  it('emits values when a key is pressed down', () => {
    const spy = jest.fn()
    const e = emitter()
    const s = keys(e)

    s.subscribe(spy)

    e.emit('keydown', { keyCode: '1' })
    expect(spy).toHaveBeenCalledWith(1)
  })

  describe('with the preventDefault option set', () => {
    it('calls preventDefault on the event', () => {
      const spy = jest.fn()
      const e = emitter()
      const s = keys(e, { preventDefault: true })

      s.subscribe()

      e.emit('keydown', { preventDefault: spy })
      expect(spy).toHaveBeenCalled()
    })
  })

  it('removes the event listener when it is unsubscribed', () => {
    const e = emitter()
    const s = keys(e)
    const a = s.subscribe()

    a.unsubscribe()

    expect(e.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true)
  })
})
