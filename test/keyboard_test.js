import * as event from './support/event'
import * as keyboard from '../src/keyboard'
import sinon from 'sinon'
import {assert} from 'chai'

describe('keyboard', () => {
  describe('.state', () => {
    it('emits the keyboard state', () => {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = keyboard.state(emitter)

      s.subscribe(spy)

      emitter.emit('keydown', {keyCode: '1'})
      assert.isTrue(spy.calledOnce)
      assert.deepEqual(Array.from(spy.firstCall.args[0]), [1])

      emitter.emit('keyup', {keyCode: '1'})
      assert.isTrue(spy.calledTwice)
      assert.deepEqual(Array.from(spy.secondCall.args[0]), [])
    })
  })
})
