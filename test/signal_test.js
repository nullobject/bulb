import Signal from '../src/signal'
import events from 'events'
import sinon from 'sinon'
import {add, always, equal, inc, range} from 'fkit'
import {assert} from 'chai'

let nextSpy, errorSpy, completeSpy, clock

describe('Signal', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
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

      range(1, 3).forEach((n, index) => {
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

      range(1, 3).forEach((n, index) => {
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

      range(1, 3).forEach((n, index) => {
        emitter.emit('lol', n)
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isFalse(completeSpy.called)
    })
  })

  describe('.fromPromise', () => {
    it('returns a signal of values from the promise', () => {
      let next, complete

      const s = Signal.fromPromise({
        then: onFulfilled => {
          next = onFulfilled
          return {
            finally: (onFinally) => { complete = onFinally }
          }
        }
      })

      s.subscribe(nextSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        next(n)
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      complete()

      assert.isTrue(completeSpy.called)
    })
  })

  describe('.periodic', () => {
    it('delays the signal values', () => {
      const spy = sinon.spy()
      const s = Signal.periodic(1000)

      s.subscribe(spy)

      clock.tick(1000)
      clock.tick(1000)
      clock.tick(1000)

      assert.isTrue(spy.calledThrice)
      assert.isTrue(spy.calledWithExactly(undefined))
    })
  })

  describe('.sequentially', () => {
    it('delays the signal values', () => {
      const s = Signal.sequentially(1000, range(1, 3))

      s.subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      assert.isTrue(nextSpy.calledWithExactly(1))
      assert.isFalse(completeSpy.called)

      clock.tick(1000)
      assert.isTrue(nextSpy.calledWithExactly(2))
      assert.isFalse(completeSpy.called)

      clock.tick(1000)
      assert.isTrue(nextSpy.calledWithExactly(3))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#subscribe', () => {
    it('calls the mount function when the first emit subscribes', () => {
      const mount = sinon.spy()
      const s = new Signal(mount)

      s.subscribe(always())
      assert.isTrue(mount.called)

      s.subscribe(always())
      assert.isTrue(mount.calledOnce)
    })

    it('calls the unmount function when the last emit unsubscribes', () => {
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
      const mount = sinon.stub().callsFake(emit => emit.next('foo'))
      const s = new Signal(mount)

      s.subscribe(nextSpy, errorSpy, completeSpy)
      assert.isTrue(nextSpy.calledWithExactly('foo'))
    })

    it('calls the error callback when the mounted function emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error('foo'))
      const s = new Signal(mount)

      s.subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledWithExactly('foo'))
    })

    it('calls the error callback when the mounted function raises an error', () => {
      const error = new Error('foo')
      const mount = sinon.stub().callsFake(() => {
        throw error
      })
      const s = new Signal(mount)

      s.subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledWithExactly(error))
    })

    it('calls the error callback when the mounted function is complete', () => {
      const mount = sinon.stub().callsFake(emit => emit.complete())
      const s = new Signal(mount)

      s.subscribe({complete: completeSpy})
      assert.isTrue(completeSpy.called)
    })
  })

  describe('#always', () => {
    it('replaces signal values with a constant', () => {
      const s = Signal.fromArray(range(1, 3)).always('x')

      s.subscribe(nextSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly('x'))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.always('x').subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#startWith', () => {
    it('emits the given value before all other values', () => {
      const s = Signal.fromArray(range(1, 3)).startWith('x')

      s.subscribe(nextSpy, errorSpy, completeSpy);

      ['x', 1, 2, 3].forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.startWith('x').subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#delay', () => {
    it('delays the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.delay(1000).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.called)

      clock.tick(1000)

      range(1, 3).forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.delay(1000).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#concatMap', () => {
    it('maps a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))
      const f = a => Signal.of(a)

      s.concatMap(f).subscribe(nextSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.concatMap(always()).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#map', () => {
    it('maps a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.map(inc).subscribe(nextSpy, errorSpy, completeSpy)

      range(2, 3).forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.map(always()).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#filter', () => {
    it('filters the signal values with a predicate', () => {
      const s = Signal.fromArray(range(1, 3))

      s.filter(equal(2)).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isTrue(nextSpy.alwaysCalledWithExactly(2))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.filter(always()).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#fold', () => {
    it('folds a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.fold(add, 0).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isTrue(nextSpy.calledWithExactly(6))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.fold(always(), 0).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#scan', () => {
    it('scans a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.scan(add, 0).subscribe(nextSpy, errorSpy, completeSpy);

      [0, 1, 3, 6].forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.scan(always(), 0).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#stateMachine', () => {
    it('scans a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      s.stateMachine((a, b, emit) => {
        emit.next(a * b)
        return a + b
      }, 0).subscribe(nextSpy, errorSpy, completeSpy);

      [0, 2, 9].forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.stateMachine(always(), 0).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#merge', () => {
    it('merges the signals', () => {
      const s = Signal.sequentially(1000, range(1, 3))
      const t = Signal.sequentially(1000, range(4, 3))
      const u = Signal.sequentially(1000, range(7, 3))

      s.merge(t, u).subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      clock.tick(1000)
      clock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 9);

      [1, 4, 7, 2, 5, 8, 3, 6, 9].forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if either signal emits an error', () => {
      let a, b
      const s = Signal.fromCallback(callback => {
        a = e => { callback(e) }
      })
      const t = Signal.fromCallback(callback => {
        b = e => { callback(e) }
      })

      s.merge(t).subscribe({error: errorSpy})

      a('foo')
      b('foo')

      assert.isTrue(errorSpy.calledTwice)
    })

    it('unmounts the signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = Signal.never()
      const t = new Signal(() => unmount)
      const a = s.merge(t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })

  describe('#zip', () => {
    it('emits a value if both signals emit a value', () => {
      const s = Signal.sequentially(1000, range(1, 3))
      const t = Signal.sequentially(1000, range(4, 3))

      s.zip(t).subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      clock.tick(1000)
      clock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 3);

      [[1, 4], [2, 5], [3, 6]].forEach((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#zipWith', () => {
    it('emits a value if both signals emit a value', () => {
      const s = Signal.sequentially(1000, range(1, 3))
      const t = Signal.sequentially(1000, range(4, 3))

      s.zipWith(add, t).subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      clock.tick(1000)
      clock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 3);

      [5, 7, 9].forEach((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if either signal emits an error', () => {
      let a, b
      const s = Signal.fromCallback(callback => {
        a = e => { callback(e) }
      })
      const t = Signal.fromCallback(callback => {
        b = e => { callback(e) }
      })

      s.zipWith(always(), t).subscribe({error: errorSpy})

      a('foo')
      b('foo')

      assert.isTrue(errorSpy.calledTwice)
    })

    it('unmounts the signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = Signal.never()
      const t = new Signal(() => unmount)
      const a = s.zipWith(always(), t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })

  describe('#sample', () => {
    it('emits the most recent value when there is an event on the sampler signal', () => {
      const s = Signal.sequentially(500, range(1, 6))
      const t = Signal.periodic(1000).always(1)

      s.sample(t).subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      clock.tick(1000)
      clock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 3);

      [2, 4, 6].forEach((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#sampleWith', () => {
    it('emits the most recent value when there is an event on the sampler signal', () => {
      const s = Signal.sequentially(500, range(1, 6))
      const t = Signal.periodic(1000).always(1)

      s.sampleWith(add, t).subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      clock.tick(1000)
      clock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 3);

      [3, 5, 7].forEach((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if either signal emits an error', () => {
      let a, b
      const s = Signal.fromCallback(callback => {
        a = e => { callback(e) }
      })
      const t = Signal.fromCallback(callback => {
        b = e => { callback(e) }
      })

      s.sampleWith(always(), t).subscribe({error: errorSpy})

      a('foo')
      b('foo')

      assert.isTrue(errorSpy.calledTwice)
    })

    it('unmounts the sampler when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = Signal.never()
      const t = new Signal(() => unmount)
      const a = s.sampleWith(always(), t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })

  describe('#dedupe', () => {
    it('removes duplicate values from the signal', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })

      s.dedupe().subscribe(nextSpy, errorSpy, completeSpy)

      a('foo')
      a('foo')
      assert.isTrue(nextSpy.firstCall.calledWithExactly('foo'))

      a('bar')
      assert.isTrue(nextSpy.secondCall.calledWithExactly('bar'))
    })
  })

  describe('#dedupeWith', () => {
    it('removes duplicate values from the signal using a comparator function', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })

      s.dedupeWith(equal).subscribe(nextSpy, errorSpy, completeSpy)

      a('foo')
      a('foo')
      assert.isTrue(nextSpy.firstCall.calledWithExactly('foo'))

      a('bar')
      assert.isTrue(nextSpy.secondCall.calledWithExactly('bar'))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      s.dedupeWith(equal).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#switch', () => {
    it('switches to the latest signal value', () => {
      const s = Signal.of('foo')
      const t = Signal.of('bar')
      const u = Signal.sequentially(1000, [s, t])

      u.switch().subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      assert.isTrue(nextSpy.firstCall.calledWithExactly('foo'))

      clock.tick(1000)
      assert.isTrue(nextSpy.secondCall.calledWithExactly('bar'))
    })

    it('unmounts the signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = new Signal(() => unmount)
      const t = Signal.of(s)
      const a = t.switch().subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })

  describe('#encode', () => {
    it('encodes the signal', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })
      const t = Signal.periodic(1000).always('foo')
      const u = Signal.periodic(1000).always('bar')

      s.encode(t, u).subscribe(nextSpy, errorSpy, completeSpy)

      a(0)
      clock.tick(1000)
      assert.isTrue(nextSpy.firstCall.calledWithExactly('foo'))

      a(1)
      clock.tick(1000)
      assert.isTrue(nextSpy.secondCall.calledWithExactly('bar'))
    })

    it('unmounts the signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = Signal.of(0)
      const t = new Signal(() => unmount)
      const a = s.encode(t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })
})
