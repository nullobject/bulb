import * as event from './support/event'
import * as keyboard from '../src/keyboard'
import sinon from 'sinon'
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
  })

  describe('.key', () => {
    it('emits values when a key is pressed down', () => {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = keyboard.key(emitter)

      s.subscribe(spy)

      emitter.emit('keydown', {
        key: 'a',
        keyCode: '1',
        repeat: 2,
        ctrlKey: 3,
        shiftKey: 4,
        altKey: 5,
        metaKey: 6
      })

      assert.isTrue(spy.calledOnce)

      assert.deepEqual(spy.firstCall.args[0], {
        key: 'a',
        code: 1,
        repeat: 2,
        ctrlKey: 3,
        shiftKey: 4,
        altKey: 5,
        metaKey: 6
      })
    })
  })
})
