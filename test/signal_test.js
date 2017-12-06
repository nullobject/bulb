'use strict'

var F = require('fkit')
var Signal = require('../src/signal')
var assert = require('chai').assert
var events = require('events')
var sinon = require('sinon')

describe('Signal', function () {
  beforeEach(function () {
    this.next = sinon.spy()
    this.error = sinon.spy()
    this.done = sinon.spy()
    this.clock = sinon.useFakeTimers()
  })

  afterEach(function () {
    this.clock.restore()
  })

  describe('.empty', function () {
    it('should return a signal with no values', function () {
      var s = Signal.empty()

      s.subscribe(this.next, this.error, this.done)

      assert.isFalse(this.next.called)
      assert.isFalse(this.error.called)
      assert.isTrue(this.done.called)
    })
  })

  describe('.of', function () {
    it('should return a signal with a single value', function () {
      var s = Signal.of(1)

      s.subscribe(this.next, this.error, this.done)

      assert.isTrue(this.next.calledWithExactly(1))
      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('.fromArray', function () {
    it('should return a signal of values from an array', function () {
      var s = Signal.fromArray(F.range(1, 3))

      s.subscribe(this.next, this.error, this.done)

      F.range(1, 3).map(function (n, index) {
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('.fromCallback', function () {
    it('should return a signal of values from the callback function', function () {
      var emit
      var s = Signal.fromCallback(function (callback) {
        emit = function (a) { callback(null, a) }
      })

      s.subscribe(this.next, this.error, this.done)

      F.range(1, 3).map(function (n, index) {
        emit(n)
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.done.called)
    })
  })

  describe('.fromEvent', function () {
    it('should return a signal of values from an event', function () {
      var emitter = new events.EventEmitter()
      var s = Signal.fromEvent(emitter, 'lol')

      s.subscribe(this.next, this.error, this.done)

      F.range(1, 3).map(function (n, index) {
        emitter.emit('lol', n)
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.done.called)
    })
  })

  describe('.fromPromise', function () {
    it('should return a signal of values from the promise', function () {
      var emit
      var s = Signal.fromPromise({
        then: function (callback) { emit = callback }
      })

      s.subscribe(this.next, this.error, this.done)

      F.range(1, 3).map(function (n, index) {
        emit(n)
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.done.called)
    })
  })

  describe('.sequentially', function () {
    it('should delay the signal values', function () {
      var s = Signal.sequentially(1000, F.range(1, 3))

      s.subscribe(this.next, this.error, this.done)

      this.clock.tick(1000)
      assert.isTrue(this.next.calledWithExactly(1))
      assert.isFalse(this.done.called)

      this.clock.tick(1000)
      assert.isTrue(this.next.calledWithExactly(2))
      assert.isFalse(this.done.called)

      this.clock.tick(1000)
      assert.isTrue(this.next.calledWithExactly(3))
      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#subscribe', function () {
    it('should bind to the signal events with a callback', function () {
      var spy = sinon.spy()
      var s = new Signal(spy)

      s.subscribe(this.next, this.error, this.done)

      assert.isTrue(spy.calledOnce)
      assert.isTrue(spy.calledWithExactly(this.next, this.error, this.done))
    })
  })

  describe('#delay', function () {
    it('should delay the signal values', function () {
      var s = Signal.fromArray(F.range(1, 3))

      s.delay(1000).subscribe(this.next, this.error, this.done)

      this.clock.tick(1000)

      F.range(1, 3).map(function (n, index) {
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#concatMap', function () {
    it('should map a function over the signal values', function () {
      var s = Signal.fromArray(F.range(1, 3))
      var f = function (a) { return Signal.of(a) }

      s.concatMap(f).subscribe(this.next, this.error, this.done)

      F.range(1, 3).map(function (n, index) {
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#map', function () {
    it('should map a function over the signal values', function () {
      var s = Signal.fromArray(F.range(1, 3))

      s.map(F.inc).subscribe(this.next, this.error, this.done)

      F.range(2, 3).map(function (n, index) {
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#filter', function () {
    it('should filter the signal values with a predicate', function () {
      var s = Signal.fromArray(F.range(1, 3))

      s.filter(F.eq(2)).subscribe(this.next, this.error, this.done)

      assert.isFalse(this.next.calledWithExactly(1))
      assert.isTrue(this.next.calledWithExactly(2))
      assert.isFalse(this.next.calledWithExactly(3))
      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#fold', function () {
    it('should fold a function over the signal values', function () {
      var s = Signal.fromArray(F.range(1, 3))

      s.fold(0, F.add).subscribe(this.next, this.error, this.done)

      assert.isTrue(this.next.calledWithExactly(6))
      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#scan', function () {
    it('should scan a function over the signal values', function () {
      var s = Signal.fromArray(F.range(1, 3))

      s.scan(0, F.add).subscribe(this.next, this.error, this.done);

      [0, 1, 3, 6].map(function (n, index) {
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#merge', function () {
    it('should merge the signals', function () {
      var s = Signal.sequentially(1000, F.range(1, 3))
      var t = Signal.sequentially(1000, F.range(4, 3))
      var u = Signal.sequentially(1000, F.range(7, 3))

      s.merge(t, u).subscribe(this.next, this.error, this.done)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      assert.strictEqual(this.next.callCount, 9);

      [1, 4, 7, 2, 5, 8, 3, 6, 9].map(function (n, index) {
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#split', function () {
    it('should split the signal', function () {
      var ss = Signal.sequentially(1000, F.range(1, 3)).split(2)
      var t = ss[0]
      var u = ss[1]

      var a = sinon.spy()
      var b = sinon.spy()
      var c = sinon.spy()
      var d = sinon.spy()
      var e = sinon.spy()
      var f = sinon.spy()

      t.subscribe(a, b, c)
      u.subscribe(d, e, f)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      F.range(1, 3).map(function (n, index) {
        var call = a.getCall(index)
        assert.isTrue(call.calledWithExactly(n))

        call = d.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(c.calledAfter(a))
      assert.isTrue(f.calledAfter(d))
    })
  })

  describe('#zip', function () {
    it('should zip the signals', function () {
      var s = Signal.sequentially(1000, F.range(1, 3))
      var t = Signal.sequentially(1000, F.range(4, 3))
      var u = Signal.sequentially(1000, F.range(7, 3))

      s.zip(t, u).subscribe(this.next, this.error, this.done)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      assert.strictEqual(this.next.callCount, 3);

      [[1, 4, 7], [2, 5, 8], [3, 6, 9]].map(function (ns, index) {
        var call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })
})
