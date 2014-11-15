'use strict';

var clock = require('../src/clock');

describe('clock', function() {
  beforeEach(function() {
    this.clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    this.clock.restore();
  });

  describe('.interval', function() {
    it('should return a new clock signal', function() {
      var spy    = sinon.spy(),
          signal = clock.interval(1000);

      signal.subscribe(spy);

      this.clock.tick(1000);
      this.clock.tick(1000);
      this.clock.tick(1000);

      expect(spy.calledThrice).to.be.true;
      expect(spy.calledWithExactly(1000)).to.be.true;
    });
  });
});
