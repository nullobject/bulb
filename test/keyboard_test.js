import * as event from './support/event'
import * as keyboard from '../src/keyboard'
import sinon from 'sinon'
import {always} from 'fkit'
import {assert} from 'chai'

describe('keyboard', () => {
  describe('.state', () => {
    it('emits values when the keyboard state changes', () => {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = keyboard.state(emitter)

      s.subscribe(spy)

      emitter.emit('keydown', {keyCode: '1'})
      assert.isTrue(spy.calledOnce)
      assert.deepEqual(spy.firstCall.args[0], [1])

      emitter.emit('keyup', {keyCode: '1'})
      assert.isTrue(spy.calledTwice)
      assert.deepEqual(spy.secondCall.args[0], [])
    })

    describe('with the preventDefault option set', () => {
      it('calls preventDefault on the event', () => {
        const spy = sinon.spy()
        const emitter = event.emitter()
        const s = keyboard.state(emitter, {preventDefault: true})

        s.subscribe(always())

        emitter.emit('keydown', {preventDefault: spy})
        assert.isTrue(spy.called)
      })
    })
  })

  describe('.keys', () => {
    it('emits values when a key is pressed down', () => {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = keyboard.keys(emitter)

      s.subscribe(spy)

      emitter.emit('keydown', {keyCode: '1'})
      assert.isTrue(spy.calledWithExactly(1))
    })

    describe('with the preventDefault option set', () => {
      it('calls preventDefault on the event', () => {
        const spy = sinon.spy()
        const emitter = event.emitter()
        const s = keyboard.keys(emitter, {preventDefault: true})

        s.subscribe(always())

        emitter.emit('keydown', {preventDefault: spy})
        assert.isTrue(spy.called)
      })
    })
  })
})
