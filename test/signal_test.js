import Signal from '../src/signal'
import events from 'events'
import sinon from 'sinon'
import {add, always, eq, inc, range} from 'fkit'
import {assert} from 'chai'

let nextSpy, errorSpy, completeSpy, fakeClock

describe('Signal', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
    fakeClock = sinon.useFakeTimers()
  })

  afterEach(() => {
    fakeClock.restore()
  })

  describe('.empty', () => {
    it('returns a signal that has already completed', () => {
      const s = Signal.empty()

      s.subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.called)
      assert.isFalse(errorSpy.called)
      assert.isTrue(completeSpy.called)
    })
  })

  describe('.never', () => {
    it('returns a signal that never completes', () => {
      const s = Signal.never()

      s.subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.called)
      assert.isFalse(errorSpy.called)
      assert.isFalse(completeSpy.called)
    })
  })

  describe('.of', () => {
    it('returns a signal with a single value', () => {
      const s = Signal.of(1)

      s.subscribe(nextSpy, errorSpy, completeSpy)

      assert.isTrue(nextSpy.calledWithExactly(1))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('.fromArray', () => {
    it('returns a signal of values from an array', () => {
      const s = Signal.fromArray(range(1, 3))

      s.subscribe(nextSpy, errorSpy, completeSpy)

      range(1, 3).map((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('.fromCallback', () => {
    it('returns a signal of values from the callback function', () => {
      let emit
      const s = Signal.fromCallback(callback => {
        emit = a => { callback(null, a) }
      })

      s.subscribe(nextSpy, errorSpy, completeSpy)

      range(1, 3).map((n, index) => {
        emit(n)
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(completeSpy.called)
    })
  })

  describe('.fromEvent', () => {
    it('returns a signal of values from an event', () => {
      const emitter = new events.EventEmitter()
      const s = Signal.fromEvent('lol', emitter)

      s.subscribe(nextSpy, errorSpy, completeSpy)

      range(1, 3).map((n, index) => {
        emitter.emit('lol', n)
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(completeSpy.called)
    })
  })

  describe('.fromPromise', () => {
    it('returns a signal of values from the promise', () => {
      let next
      let complete

      const s = Signal.fromPromise({
        then: onFulfilled => {
          next = onFulfilled
          return {
            finally: (onFinally) => { complete = onFinally }
          }
        }
      })

      s.subscribe(nextSpy, errorSpy, completeSpy)

      range(1, 3).map((n, index) => {
        next(n)
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      complete()

      assert.isTrue(completeSpy.called)
    })
  })

  describe('.sequentially', () => {
    it('delays the signal values', () => {
      const s = Signal.sequentially(1000, range(1, 3))

      s.subscribe(nextSpy, errorSpy, completeSpy)

      fakeClock.tick(1000)
      assert.isTrue(nextSpy.calledWithExactly(1))
      assert.isFalse(completeSpy.called)

      fakeClock.tick(1000)
      assert.isTrue(nextSpy.calledWithExactly(2))
      assert.isFalse(completeSpy.called)

      fakeClock.tick(1000)
      assert.isTrue(nextSpy.calledWithExactly(3))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#subscribe', () => {
    it('calls the mount function when the first observer subscribes', () => {
      const mount = sinon.spy()
      const s = new Signal(mount)

      s.subscribe(always())
      assert.isTrue(mount.called)

      s.subscribe(always())
      assert.isTrue(mount.calledOnce)
    })

    it('calls the unmount function when the last observer unsubscribes', () => {
      const unmount = sinon.spy()
      const s = new Signal(() => unmount)

      const a = s.subscribe(always())
      const b = s.subscribe(always())

      a.unsubscribe()
      assert.isFalse(unmount.called)

      b.unsubscribe()
      assert.isTrue(unmount.calledOnce)
    })

    it('calls the next callback when the mounted function emits a value', () => {
      const mount = sinon.stub().callsFake(observer => observer.next())
      const s = new Signal(mount)

      s.subscribe(nextSpy, errorSpy, completeSpy)

      assert.isTrue(nextSpy.called)
      assert.isFalse(errorSpy.called)
      assert.isFalse(completeSpy.called)
    })

    it('completes the observers when the mounted function is complete')
  })

  describe('#delay', () => {
    it('delays the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.delay(1000).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.called)

      fakeClock.tick(1000)

      range(1, 3).map((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#concatMap', () => {
    it('maps a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))
      const f = a => Signal.of(a)

      s.concatMap(f).subscribe(nextSpy, errorSpy, completeSpy)

      range(1, 3).map((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#map', () => {
    it('maps a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.map(inc).subscribe(nextSpy, errorSpy, completeSpy)

      range(2, 3).map((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#filter', () => {
    it('filters the signal values with a predicate', () => {
      const s = Signal.fromArray(range(1, 3))

      s.filter(eq(2)).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.calledWithExactly(1))
      assert.isTrue(nextSpy.calledWithExactly(2))
      assert.isFalse(nextSpy.calledWithExactly(3))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#fold', () => {
    it('folds a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.fold(add, 0).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isTrue(nextSpy.calledWithExactly(6))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#scan', () => {
    it('scans a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.scan(add, 0).subscribe(nextSpy, errorSpy, completeSpy);

      [0, 1, 3, 6].map((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#merge', () => {
    it('merges the signals', () => {
      const s = Signal.sequentially(1000, range(1, 3))
      const t = Signal.sequentially(1000, range(4, 3))
      const u = Signal.sequentially(1000, range(7, 3))

      s.merge([t, u]).subscribe(nextSpy, errorSpy, completeSpy)

      fakeClock.tick(1000)
      fakeClock.tick(1000)
      fakeClock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 9);

      [1, 4, 7, 2, 5, 8, 3, 6, 9].map((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#zip', () => {
    it('zips the signals', () => {
      const s = Signal.sequentially(1000, range(1, 3))
      const t = Signal.sequentially(1000, range(4, 3))

      s.zip(t).subscribe(nextSpy, errorSpy, completeSpy)

      fakeClock.tick(1000)
      fakeClock.tick(1000)
      fakeClock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 3);

      [[1, 4], [2, 5], [3, 6]].map((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#zipWith', () => {
    it('zips the signals', () => {
      const s = Signal.sequentially(1000, range(1, 3))
      const t = Signal.sequentially(1000, range(4, 3))

      s.zipWith(add, t).subscribe(nextSpy, errorSpy, completeSpy)

      fakeClock.tick(1000)
      fakeClock.tick(1000)
      fakeClock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 3);

      [5, 7, 9].map((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })
})
