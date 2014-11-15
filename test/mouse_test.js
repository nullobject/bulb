'use strict';

var event = require('./support/event'),
    mouse = require('../src/mouse');

describe('mouse', function() {
  describe('.position', function() {
    it('should return a new mouse position signal', function() {
      var spy     = sinon.spy(),
          emitter = event.emitter(),
          signal  = mouse.position(emitter);

      signal.subscribe(spy);

      emitter.emit('mousemove', {clientX: 1, clientY: 2});
      expect(spy.calledWithExactly([1, 2])).to.be.true;
    });
  });

  describe('.button', function() {
    it('should return a new mouse button signal', function() {
      var spy     = sinon.spy(),
          emitter = event.emitter(),
          signal  = mouse.button(emitter);

      signal.subscribe(spy);

      emitter.emit('mousedown');
      expect(spy.calledWithExactly(true)).to.be.true;

      emitter.emit('mouseup');
      expect(spy.calledWithExactly(false)).to.be.true;
    });
  });
});
