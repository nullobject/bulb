const F = require('fkit')
const Signal = require('../src/signal')
const assert = require('chai').assert
const events = require('events')
const sinon = require('sinon')

describe('Signal', () => {
  beforeEach(() => {
    this.next = sinon.spy()
    this.error = sinon.spy()
    this.complete = sinon.spy()
    this.clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    this.clock.restore()
  })

  describe('.empty', () => {
    it('returns a signal with no values', () => {
      const s = Signal.empty()

      s.subscribe(this.next, this.error, this.complete)

      assert.isFalse(this.next.called)
      assert.isFalse(this.error.called)
      assert.isTrue(this.complete.called)
    })
  })

  describe('.of', () => {
    it('returns a signal with a single value', () => {
      const s = Signal.of(1)

      s.subscribe(this.next, this.error, this.complete)

      assert.isTrue(this.next.calledWithExactly(1))
      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('.fromArray', () => {
    it('returns a signal of values from an array', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.subscribe(this.next, this.error, this.complete)

      F.range(1, 3).map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('.fromCallback', () => {
    it('returns a signal of values from the callback function', () => {
      let emit
      const s = Signal.fromCallback(callback => {
        emit = a => { callback(null, a) }
      })

      s.subscribe(this.next, this.error, this.complete)

      F.range(1, 3).map((n, index) => {
        emit(n)
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.complete.called)
    })
  })

  describe('.fromEvent', () => {
    it('returns a signal of values from an event', () => {
      const emitter = new events.EventEmitter()
      const s = Signal.fromEvent('lol', emitter)

      s.subscribe(this.next, this.error, this.complete)

      F.range(1, 3).map((n, index) => {
        emitter.emit('lol', n)
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.complete.called)
    })
  })

  describe('.fromPromise', () => {
    it('returns a signal of values from the promise', () => {
      let emit
      const s = Signal.fromPromise({
        then: callback => { emit = callback }
      })

      s.subscribe(this.next, this.error, this.complete)

      F.range(1, 3).map((n, index) => {
        emit(n)
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.complete.called)
    })
  })

  describe('.sequentially', () => {
    it('delays the signal values', () => {
      const s = Signal.sequentially(1000, F.range(1, 3))

      s.subscribe(this.next, this.error, this.complete)

      this.clock.tick(1000)
      assert.isTrue(this.next.calledWithExactly(1))
      assert.isFalse(this.complete.called)

      this.clock.tick(1000)
      assert.isTrue(this.next.calledWithExactly(2))
      assert.isFalse(this.complete.called)

      this.clock.tick(1000)
      assert.isTrue(this.next.calledWithExactly(3))
      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('#subscribe', () => {
    it('binds to the signal events with a callback', () => {
      const spy = sinon.spy()
      const s = new Signal(spy)

      s.subscribe(this.next, this.error, this.complete)

      assert.isTrue(spy.calledOnce)
      assert.isTrue(spy.calledWithExactly(this.next, this.error, this.complete))
    })
  })

  describe('#delay', () => {
    it('delays the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.delay(1000).subscribe(this.next, this.error, this.complete)

      this.clock.tick(1000)

      F.range(1, 3).map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('#concatMap', () => {
    it('maps a function over the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))
      const f = a => Signal.of(a)

      s.concatMap(f).subscribe(this.next, this.error, this.complete)

      F.range(1, 3).map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('#map', () => {
    it('maps a function over the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.map(F.inc).subscribe(this.next, this.error, this.complete)

      F.range(2, 3).map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('#filter', () => {
    it('filters the signal values with a predicate', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.filter(F.eq(2)).subscribe(this.next, this.error, this.complete)

      assert.isFalse(this.next.calledWithExactly(1))
      assert.isTrue(this.next.calledWithExactly(2))
      assert.isFalse(this.next.calledWithExactly(3))
      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('#fold', () => {
    it('folds a function over the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.fold(F.add, 0).subscribe(this.next, this.error, this.complete)

      assert.isTrue(this.next.calledWithExactly(6))
      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('#scan', () => {
    it('scans a function over the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.scan(F.add, 0).subscribe(this.next, this.error, this.complete);

      [0, 1, 3, 6].map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('#merge', () => {
    it('merges the signals', () => {
      const s = Signal.sequentially(1000, F.range(1, 3))
      const t = Signal.sequentially(1000, F.range(4, 3))
      const u = Signal.sequentially(1000, F.range(7, 3))

      s.merge(t, u).subscribe(this.next, this.error, this.complete)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      assert.strictEqual(this.next.callCount, 9);

      [1, 4, 7, 2, 5, 8, 3, 6, 9].map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })

  describe('#zip', () => {
    it('zips the signals', () => {
      const s = Signal.sequentially(1000, F.range(1, 3))
      const t = Signal.sequentially(1000, F.range(4, 3))
      const u = Signal.sequentially(1000, F.range(7, 3))

      s.zip(t, u).subscribe(this.next, this.error, this.complete)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      assert.strictEqual(this.next.callCount, 3);

      [[1, 4, 7], [2, 5, 8], [3, 6, 9]].map((ns, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(this.complete.calledAfter(this.next))
    })
  })
})
