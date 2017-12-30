import * as event from './support/event'
import * as mouse from '../src/mouse'
import sinon from 'sinon'
import {assert} from 'chai'

describe('mouse', () => {
  describe('.state', () => {
    it('returns a new mouse position signal', () => {
      const spy = sinon.spy()
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

      assert.deepEqual(spy.firstCall.args[0], {
        buttons: 0,
        x: 1,
        y: 2,
        ctrlKey: 3,
        shiftKey: 4,
        altKey: 5,
        metaKey: 6
      })
    })
  })

  describe('.position', () => {
    it('returns a new mouse position signal', () => {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = mouse.position(emitter)

      s.subscribe(spy)

      emitter.emit('mousemove', {clientX: 1, clientY: 2})
      assert.isTrue(spy.calledWithExactly([1, 2]))
    })
  })

  describe('.button', () => {
    it('returns a new mouse button signal', () => {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = mouse.button(emitter)

      s.subscribe(spy)

      emitter.emit('mousedown', {buttons: 1})
      assert.isTrue(spy.calledWithExactly(1))
    })
  })
})
