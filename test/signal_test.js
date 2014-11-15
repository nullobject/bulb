'use strict';

var events = require('events'),
    F      = require('fkit'),
    Signal = require('../src/signal');

describe('Signal', function() {
  beforeEach(function() {
    this.next  = sinon.spy();
    this.done  = sinon.spy();
    this.clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    this.clock.restore();
  });

  describe('.of', function() {
    it('should return a signal with a single value', function() {
      var s = Signal.of(1);

      s.subscribe(this.next, this.done);

      expect(this.next.calledWithExactly(1)).to.be.true;
      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('.fromArray', function() {
    it('should return a signal of values from an array', function() {
      var s = Signal.fromArray(F.range(1, 3));

      s.subscribe(this.next, this.done);

      F.range(1, 3).map(function(n, index) {
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('.fromCallback', function() {
    it('should return a signal of values from the callback function', function() {
      var emit;
      var s = Signal.fromCallback(function(callback) {
        emit = callback;
      });

      s.subscribe(this.next, this.done);

      F.range(1, 3).map(function(n, index) {
        emit(n);
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.called).to.be.false;
    });
  });

  describe('.fromEvent', function() {
    it('should return a signal of values from an event', function() {
      var emitter = new events.EventEmitter(),
          s       = Signal.fromEvent(emitter, 'lol');

      s.subscribe(this.next, this.done);

      F.range(1, 3).map(function(n, index) {
        emitter.emit('lol', n);
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.called).to.be.false;
    });
  });

  describe('.fromPromise', function() {
    it('should return a signal of values from the promise', function() {
      var emit;
      var s = Signal.fromPromise({
        then: function(callback) { emit = callback; }
      });

      s.subscribe(this.next, this.done);

      F.range(1, 3).map(function(n, index) {
        emit(n);
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.called).to.be.false;
    });
  });

  describe('.sequentially', function() {
    it('should delay the signal values', function() {
      var s = Signal.sequentially(1000, F.range(1, 3));

      s.subscribe(this.next, this.done);

      this.clock.tick(1000);
      expect(this.next.calledWithExactly(1)).to.be.true;
      expect(this.done.called).to.be.false;

      this.clock.tick(1000);
      expect(this.next.calledWithExactly(2)).to.be.true;
      expect(this.done.called).to.be.false;

      this.clock.tick(1000);
      expect(this.next.calledWithExactly(3)).to.be.true;
      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('#subscribe', function() {
    it('should bind to the signal events with a callback', function() {
      var spy = sinon.spy(),
          s   = new Signal(spy);

      s.subscribe(this.next, this.done);

      expect(spy.calledOnce).to.be.true;
      expect(spy.calledWithExactly(this.next, this.done)).to.be.true;
    });
  });

  describe('#delay', function() {
    it('should delay the signal values', function() {
      var s = Signal.fromArray(F.range(1, 3));

      s.delay(1000).subscribe(this.next, this.done);

      this.clock.tick(1000);

      F.range(1, 3).map(function(n, index) {
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('#concatMap', function() {
    it('should concat map a function over the signal values', function() {
      var s = Signal.fromArray(F.range(1, 3));
      var f = function(a) { return Signal.of(a); };

      s.concatMap(f).subscribe(this.next, this.done);

      F.range(1, 3).map(function(n, index) {
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('#map', function() {
    it('should map the a function over the signal values', function() {
      var s = Signal.fromArray(F.range(1, 3));

      s.map(F.inc).subscribe(this.next, this.done);

      [2, 3, 4].map(function(n, index) {
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('#filter', function() {
    it('should filter the signal values with a predicate', function() {
      var s = Signal.fromArray(F.range(1, 3));

      s.filter(F.eq(2)).subscribe(this.next, this.done);

      expect(this.next.calledWithExactly(1)).to.be.false;
      expect(this.next.calledWithExactly(2)).to.be.true;
      expect(this.next.calledWithExactly(3)).to.be.false;
      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('#fold', function() {
    it('should fold a function over the signal values', function() {
      var s = Signal.fromArray(F.range(1, 3));

      s.fold(0, F.add).subscribe(this.next, this.done);

      expect(this.next.calledWithExactly(6)).to.be.true;
      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('#scan', function() {
    it('should scan a function over the signal values', function() {
      var s = Signal.fromArray(F.range(1, 3));

      s.scan(0, F.add).subscribe(this.next, this.done);

      [0, 1, 3, 6].map(function(n, index) {
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('#merge', function() {
    it('should merge the signals', function() {
      var s = Signal.sequentially(1000, F.range(1, 3)),
          t = Signal.sequentially(1000, F.range(4, 3)),
          u = Signal.sequentially(1000, F.range(7, 3));

      s.merge(t, u).subscribe(this.next, this.done);

      this.clock.tick(1000);
      this.clock.tick(1000);
      this.clock.tick(1000);

      expect(this.next.callCount).to.equal(9);

      [1, 4, 7, 2, 5, 8, 3, 6, 9].map(function(n, index) {
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });

  describe('#split', function() {
    it('should split the signal', function() {
      var ss = Signal.sequentially(1000, F.range(1, 3)).split(2),
          t  = ss[0],
          u  = ss[1];

      var a = sinon.spy(),
          b = sinon.spy(),
          c = sinon.spy(),
          d = sinon.spy();

      t.subscribe(a, b);
      u.subscribe(c, d);

      this.clock.tick(1000);
      this.clock.tick(1000);
      this.clock.tick(1000);

      F.range(1, 3).map(function(n, index) {
        var call = a.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;

        call = c.getCall(index);
        expect(call.calledWithExactly(n)).to.be.true;
      }, this);

      expect(b.calledAfter(a)).to.be.true;
      expect(d.calledAfter(c)).to.be.true;
    });
  });

  describe('#zip', function() {
    it('should zip the signals', function() {
      var s = Signal.sequentially(1000, F.range(1, 3)),
          t = Signal.sequentially(1000, F.range(4, 3)),
          u = Signal.sequentially(1000, F.range(7, 3));

      s.zip(t, u).subscribe(this.next, this.done);

      this.clock.tick(1000);
      this.clock.tick(1000);
      this.clock.tick(1000);

      expect(this.next.callCount).to.equal(3);

      [[1, 4, 7], [2, 5, 8], [3, 6, 9]].map(function(ns, index) {
        var call = this.next.getCall(index);
        expect(call.calledWithExactly(ns)).to.be.true;
      }, this);

      expect(this.done.calledAfter(this.next)).to.be.true;
    });
  });
});
