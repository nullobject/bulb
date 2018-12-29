import { always } from 'fkit'

import * as event from '../test/support/event'
import * as keyboard from '../src/keyboard'

describe('keyboard', () => {
  describe('.state', () => {
    it('emits values when the keyboard state changes', () => {
      const spy = jest.fn()
      const emitter = event.emitter()
      const s = keyboard.state(emitter)

      s.subscribe(spy)

      emitter.emit('keydown', { keyCode: '1' })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith([1])

      emitter.emit('keyup', { keyCode: '1' })
      expect(spy).toHaveBeenCalledTimes(2)
      expect(spy).toHaveBeenLastCalledWith([])
    })

    describe('with the preventDefault option set', () => {
      it('calls preventDefault on the event', () => {
        const spy = jest.fn()
        const emitter = event.emitter()
        const s = keyboard.state(emitter, { preventDefault: true })

        s.subscribe()

        emitter.emit('keydown', { preventDefault: spy })
        expect(spy).toHaveBeenCalled()
      })
    })
  })

  describe('.keys', () => {
    it('emits values when a key is pressed down', () => {
      const spy = jest.fn()
      const emitter = event.emitter()
      const s = keyboard.keys(emitter)

      s.subscribe(spy)

      emitter.emit('keydown', { keyCode: '1' })
      expect(spy).toHaveBeenCalledWith(1)
    })

    describe('with the preventDefault option set', () => {
      it('calls preventDefault on the event', () => {
        const spy = jest.fn()
        const emitter = event.emitter()
        const s = keyboard.keys(emitter, { preventDefault: true })

        s.subscribe()

        emitter.emit('keydown', { preventDefault: spy })
        expect(spy).toHaveBeenCalled()
      })
    })
  })
})
