import * as event from './support/event'
import * as mouse from '../src/mouse'
import {always} from 'fkit'

describe('mouse', () => {
  describe('.state', () => {
    it('returns a new mouse position signal', () => {
      const spy = jest.fn()
      const emitter = event.emitter()
      const s = mouse.state(emitter)

      s.subscribe(spy)

      emitter.emit('mousemove', {
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
        const emitter = event.emitter()
        const s = mouse.state(emitter, {preventDefault: true})

        s.subscribe(always())

        emitter.emit('mousedown', {preventDefault: spy})
        expect(spy).toHaveBeenCalled()
      })
    })
  })

  describe('.position', () => {
    it('returns a new mouse position signal', () => {
      const spy = jest.fn()
      const emitter = event.emitter()
      const s = mouse.position(emitter)

      s.subscribe(spy)

      emitter.emit('mousemove', {clientX: 1, clientY: 2})
      expect(spy).toHaveBeenCalledWith([1, 2])
    })

    describe('with the preventDefault option set', () => {
      it('calls preventDefault on the event', () => {
        const spy = jest.fn()
        const emitter = event.emitter()
        const s = mouse.position(emitter, {preventDefault: true})

        s.subscribe(always())

        emitter.emit('mousemove', {preventDefault: spy})
        expect(spy).toHaveBeenCalled()
      })
    })
  })

  describe('.buttons', () => {
    it('returns a new mouse buttons signal', () => {
      const spy = jest.fn()
      const emitter = event.emitter()
      const s = mouse.buttons(emitter)

      s.subscribe(spy)

      emitter.emit('mousedown', {buttons: 1})
      expect(spy).toHaveBeenCalledWith(1)
    })

    describe('with the preventDefault option set', () => {
      it('calls preventDefault on the event', () => {
        const spy = jest.fn()
        const emitter = event.emitter()
        const s = mouse.buttons(emitter, {preventDefault: true})

        s.subscribe(always())

        emitter.emit('mousedown', {preventDefault: spy})
        expect(spy).toHaveBeenCalled()
      })
    })
  })
})
