const assert = require('chai').assert
const event = require('./support/event')
const mouse = require('../src/mouse')
const sinon = require('sinon')

describe('mouse', function () {
  describe('.position', function () {
    it('should return a new mouse position signal', function () {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = mouse.position(emitter)

      s.subscribe(spy)

      emitter.emit('mousemove', {clientX: 1, clientY: 2})
      assert.isTrue(spy.calledWithExactly([1, 2]))
    })
  })

  describe('.button', function () {
    it('should return a new mouse button signal', function () {
      const spy = sinon.spy()
      const emitter = event.emitter()
      const s = mouse.button(emitter)

      s.subscribe(spy)

      emitter.emit('mousedown')
      assert.isTrue(spy.calledWithExactly(true))

      emitter.emit('mouseup')
      assert.isTrue(spy.calledWithExactly(false))
    })
  })
})
