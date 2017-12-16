import * as event from './support/event'
import * as keyboard from '../src/keyboard'
import sinon from 'sinon'
import {assert} from 'chai'

describe('keyboard', () => {
  describe('.keys', () => {
    it('returns a signal that emits the keyboard state', () => {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = keyboard.keys(emitter)

      s.subscribe(spy)

      emitter.emit('keydown', {keyCode: '1'})
      assert.isTrue(spy.calledOnce)
      assert.deepEqual(spy.firstCall.args[0], {'1': true})

      emitter.emit('keyup', {keyCode: '1'})
      assert.isTrue(spy.calledTwice)
      assert.deepEqual(spy.secondCall.args[0], {})
    })
  })
})
