import emitter from '../internal/emitter'
import state from './state'

describe('state', () => {
  it('emits values when the keyboard state changes', () => {
    const spy = jest.fn()
    const e = emitter()
    const s = state(e)

    s.subscribe(spy)

    e.emit('keydown', { keyCode: '1' })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenLastCalledWith([1])

    e.emit('keyup', { keyCode: '1' })
    expect(spy).toHaveBeenCalledTimes(2)
    expect(spy).toHaveBeenLastCalledWith([])
  })

  describe('with the preventDefault option set', () => {
    it('calls preventDefault on the event', () => {
      const spy = jest.fn()
      const e = emitter()
      const s = state(e, { preventDefault: true })

      s.subscribe()

      e.emit('keydown', { preventDefault: spy })
      expect(spy).toHaveBeenCalled()
    })
  })

  it('removes the event listeners when it is unsubscribed', () => {
    const e = emitter()
    const s = state(e)
    const a = s.subscribe()

    a.unsubscribe()

    expect(e.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function), true)
    expect(e.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function), true)
  })
})
