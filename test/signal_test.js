const F = require('fkit')
const Signal = require('../src/signal')
const assert = require('chai').assert
const events = require('events')
const sinon = require('sinon')

describe('Signal', () => {
  beforeEach(() => {
    this.next = sinon.spy()
    this.error = sinon.spy()
    this.done = sinon.spy()
    this.clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    this.clock.restore()
  })

  describe('.empty', () => {
    it('should return a signal with no values', () => {
      const s = Signal.empty()

      s.subscribe(this.next, this.error, this.done)

      assert.isFalse(this.next.called)
      assert.isFalse(this.error.called)
      assert.isTrue(this.done.called)
    })
  })

  describe('.of', () => {
    it('should return a signal with a single value', () => {
      const s = Signal.of(1)

      s.subscribe(this.next, this.error, this.done)

      assert.isTrue(this.next.calledWithExactly(1))
      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('.fromArray', () => {
    it('should return a signal of values from an array', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.subscribe(this.next, this.error, this.done)

      F.range(1, 3).map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('.fromCallback', () => {
    it('should return a signal of values from the callback function', () => {
      let emit
      const s = Signal.fromCallback(callback => {
        emit = a => { callback(null, a) }
      })

      s.subscribe(this.next, this.error, this.done)

      F.range(1, 3).map((n, index) => {
        emit(n)
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.done.called)
    })
  })

  describe('.fromEvent', () => {
    it('should return a signal of values from an event', () => {
      const emitter = new events.EventEmitter()
      const s = Signal.fromEvent(emitter, 'lol')

      s.subscribe(this.next, this.error, this.done)

      F.range(1, 3).map((n, index) => {
        emitter.emit('lol', n)
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.done.called)
    })
  })

  describe('.fromPromise', () => {
    it('should return a signal of values from the promise', () => {
      let emit
      const s = Signal.fromPromise({
        then: callback => { emit = callback }
      })

      s.subscribe(this.next, this.error, this.done)

      F.range(1, 3).map((n, index) => {
        emit(n)
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(this.done.called)
    })
  })

  describe('.sequentially', () => {
    it('should delay the signal values', () => {
      const s = Signal.sequentially(1000, F.range(1, 3))

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

  describe('#subscribe', () => {
    it('should bind to the signal events with a callback', () => {
      const spy = sinon.spy()
      const s = new Signal(spy)

      s.subscribe(this.next, this.error, this.done)

      assert.isTrue(spy.calledOnce)
      assert.isTrue(spy.calledWithExactly(this.next, this.error, this.done))
    })
  })

  describe('#delay', () => {
    it('should delay the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.delay(1000).subscribe(this.next, this.error, this.done)

      this.clock.tick(1000)

      F.range(1, 3).map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#concatMap', () => {
    it('should map a function over the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))
      const f = a => Signal.of(a)

      s.concatMap(f).subscribe(this.next, this.error, this.done)

      F.range(1, 3).map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#map', () => {
    it('should map a function over the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.map(F.inc).subscribe(this.next, this.error, this.done)

      F.range(2, 3).map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#filter', () => {
    it('should filter the signal values with a predicate', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.filter(F.eq(2)).subscribe(this.next, this.error, this.done)

      assert.isFalse(this.next.calledWithExactly(1))
      assert.isTrue(this.next.calledWithExactly(2))
      assert.isFalse(this.next.calledWithExactly(3))
      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#fold', () => {
    it('should fold a function over the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.fold(0, F.add).subscribe(this.next, this.error, this.done)

      assert.isTrue(this.next.calledWithExactly(6))
      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#scan', () => {
    it('should scan a function over the signal values', () => {
      const s = Signal.fromArray(F.range(1, 3))

      s.scan(0, F.add).subscribe(this.next, this.error, this.done)

      [0, 1, 3, 6].map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#merge', () => {
    it('should merge the signals', () => {
      const s = Signal.sequentially(1000, F.range(1, 3))
      const t = Signal.sequentially(1000, F.range(4, 3))
      const u = Signal.sequentially(1000, F.range(7, 3))

      s.merge(t, u).subscribe(this.next, this.error, this.done)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      assert.strictEqual(this.next.callCount, 9)

      [1, 4, 7, 2, 5, 8, 3, 6, 9].map((n, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })

  describe('#split', () => {
    it('should split the signal', () => {
      const ss = Signal.sequentially(1000, F.range(1, 3)).split(2)
      const t = ss[0]
      const u = ss[1]

      const a = sinon.spy()
      const b = sinon.spy()
      const c = sinon.spy()
      const d = sinon.spy()
      const e = sinon.spy()
      const f = sinon.spy()

      t.subscribe(a, b, c)
      u.subscribe(d, e, f)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      F.range(1, 3).map((n, index) => {
        let call = a.getCall(index)
        assert.isTrue(call.calledWithExactly(n))

        call = d.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(c.calledAfter(a))
      assert.isTrue(f.calledAfter(d))
    })
  })

  describe('#zip', () => {
    it('should zip the signals', () => {
      const s = Signal.sequentially(1000, F.range(1, 3))
      const t = Signal.sequentially(1000, F.range(4, 3))
      const u = Signal.sequentially(1000, F.range(7, 3))

      s.zip(t, u).subscribe(this.next, this.error, this.done)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      assert.strictEqual(this.next.callCount, 3)

      [[1, 4, 7], [2, 5, 8], [3, 6, 9]].map((ns, index) => {
        const call = this.next.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(this.done.calledAfter(this.next))
    })
  })
})
