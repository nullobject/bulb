import Signal from '../src/signal'
import events from 'events'
import sinon from 'sinon'
import {always, range} from 'fkit'
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

  describe('.sequential', () => {
    it('delays the signal values', () => {
      const s = Signal.sequential(1000, range(1, 3))

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
})
