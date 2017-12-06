'use strict'

var assert = require('chai').assert
var event = require('./support/event')
var mouse = require('../src/mouse')
var sinon = require('sinon')

describe('mouse', function () {
  describe('.position', function () {
    it('should return a new mouse position signal', function () {
      var spy = sinon.spy()
      var emitter = event.emitter()
      var s = mouse.position(emitter)

      s.subscribe(spy)

      emitter.emit('mousemove', {clientX: 1, clientY: 2})
      assert.isTrue(spy.calledWithExactly([1, 2]))
    })
  })

  describe('.button', function () {
    it('should return a new mouse button signal', function () {
      var spy = sinon.spy()
      var emitter = event.emitter()
      var s = mouse.button(emitter)

      s.subscribe(spy)

      emitter.emit('mousedown')
      assert.isTrue(spy.calledWithExactly(true))

      emitter.emit('mouseup')
      assert.isTrue(spy.calledWithExactly(false))
    })
  })
})
