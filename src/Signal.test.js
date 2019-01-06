import events from 'events'
import { range } from 'fkit'

import Signal from './Signal'

let valueSpy, errorSpy, completeSpy

describe('Signal', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  describe('.empty', () => {
    it('returns a signal that has already completed', () => {
      const s = Signal.empty()

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(valueSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.never', () => {
    it('returns a signal that never completes', () => {
      const s = Signal.never()

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(valueSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
      expect(completeSpy).not.toHaveBeenCalled()
    })
  })

  describe('.of', () => {
    it('returns a signal with a single value', () => {
      const s = Signal.of(1)

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(valueSpy).toHaveBeenCalledWith(1)
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.fromArray', () => {
    it('returns a signal of values from an array', done => {
      const s = Signal.fromArray(range(1, 3))

      s.subscribe(valueSpy, errorSpy, completeSpy)

      setTimeout(() => {
        range(1, 3).forEach((n, index) => {
          expect(valueSpy.mock.calls[index][0]).toBe(n)
        }, this)

        expect(completeSpy).toHaveBeenCalled()
        done()
      }, 0)
    })
  })

  describe('.fromCallback', () => {
    it('returns a signal of values from the callback function', () => {
      let emit
      const s = Signal.fromCallback(callback => {
        emit = a => { callback(null, a) }
      })

      s.subscribe(valueSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        emit(n)
        expect(valueSpy.mock.calls[index][0]).toBe(n)
      }, this)

      expect(completeSpy).not.toHaveBeenCalled()
    })
  })

  describe('.fromEvent', () => {
    it('returns a signal of values from an event', () => {
      const emitter = new events.EventEmitter()
      const s = Signal.fromEvent('lol', emitter)

      s.subscribe(valueSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        emitter.emit('lol', n)
        expect(valueSpy.mock.calls[index][0]).toBe(n)
      }, this)

      expect(completeSpy).not.toHaveBeenCalled()
    })
  })

  describe('.fromPromise', () => {
    it('returns a signal of values from the promise', () => {
      let value, complete

      const s = Signal.fromPromise({
        then: onFulfilled => {
          value = onFulfilled
          return {
            finally: onFinally => { complete = onFinally }
          }
        }
      })

      s.subscribe(valueSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        value(n)
        expect(valueSpy.mock.calls[index][0]).toBe(n)
      }, this)

      complete()

      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.periodic', () => {
    it('periodically emits a value', () => {
      jest.useFakeTimers()

      const spy = jest.fn()
      const s = Signal.periodic(1000)

      s.subscribe(spy)

      jest.advanceTimersByTime(1000)
      jest.advanceTimersByTime(1000)
      jest.advanceTimersByTime(1000)

      expect(spy).toHaveBeenCalledTimes(3)
      expect(spy).toHaveBeenCalledWith(undefined)

      jest.useRealTimers()
    })
  })

  describe('.sequential', () => {
    it('periodically emits values from an array', () => {
      jest.useFakeTimers()

      const s = Signal.sequential(1000, range(1, 3))

      s.subscribe(valueSpy, errorSpy, completeSpy)

      jest.advanceTimersByTime(1000)
      expect(valueSpy).toHaveBeenCalledWith(1)
      expect(completeSpy).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)
      expect(valueSpy).toHaveBeenCalledWith(2)
      expect(completeSpy).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)
      expect(valueSpy).toHaveBeenCalledWith(3)
      expect(completeSpy).toHaveBeenCalled()

      jest.useRealTimers()
    })
  })

  describe('#subscribe', () => {
    it('calls the mount function when the first observer subscribes', () => {
      const mount = jest.fn()
      const s = new Signal(mount)

      s.subscribe()
      expect(mount).toHaveBeenCalled()

      s.subscribe()
      expect(mount).toHaveBeenCalledTimes(1)
    })

    it('calls the unmount function when the last observer unsubscribes', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const a = s.subscribe()
      const b = s.subscribe()

      a.unsubscribe()
      expect(unmount).not.toHaveBeenCalled()

      b.unsubscribe()
      expect(unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the value callback when the signal emits a value', () => {
      const mount = jest.fn(emit => emit.value('foo'))
      const s = new Signal(mount)

      s.subscribe(valueSpy, errorSpy, completeSpy)
      expect(valueSpy).toHaveBeenCalledWith('foo')
    })

    it('calls the error callback when the signal emits an error', () => {
      const mount = jest.fn(emit => emit.error('foo'))
      const s = new Signal(mount)

      s.subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledWith('foo')
    })

    it('calls the error callback when the signal raises an error', () => {
      const error = new Error('foo')
      const mount = jest.fn(() => {
        throw error
      })
      const s = new Signal(mount)

      s.subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledWith(error)
    })

    it('calls the error callback when the signal is complete', () => {
      const mount = jest.fn(emit => emit.complete())
      const s = new Signal(mount)

      s.subscribe({ complete: completeSpy })
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('#always', () => {
    it('replaces signal values with a constant', done => {
      const s = Signal.fromArray(range(1, 3)).always('x')

      s.subscribe(valueSpy, errorSpy, completeSpy)

      setTimeout(() => {
        range(1, 3).forEach((n, index) => {
          expect(valueSpy.mock.calls[index][0]).toBe('x')
        }, this)

        expect(completeSpy).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      s.always('x').subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#startWith', () => {
    it('emits the given value before all other values', done => {
      const s = Signal.fromArray(range(1, 3)).startWith('x')

      s.subscribe(valueSpy, errorSpy, completeSpy)

      setTimeout(() => {
        ['x', 1, 2, 3].forEach((n, index) => {
          expect(valueSpy.mock.calls[index][0]).toBe(n)
        }, this)

        expect(completeSpy).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      s.startWith('x').subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#cycle', () => {
    it('cycles through the values of an array', () => {
      jest.useFakeTimers()

      const s = Signal.periodic(1000).cycle(range(1, 3))

      s.subscribe(valueSpy, errorSpy, completeSpy)

      range(0, 6).forEach(n => {
        jest.advanceTimersByTime(1000)
        expect(valueSpy).toHaveBeenNthCalledWith(n + 1, (n % 3) + 1)
      })

      expect(completeSpy).not.toHaveBeenCalled()

      jest.useRealTimers()
    })
  })

  describe('#sequential', () => {
    it('sequentially emits the values of an array', () => {
      jest.useFakeTimers()

      const s = Signal.periodic(1000).sequential(range(1, 3))

      s.subscribe(valueSpy, errorSpy, completeSpy)

      range(1, 3).forEach(n => {
        jest.advanceTimersByTime(1000)
        expect(valueSpy).toHaveBeenNthCalledWith(n, n)
      })

      expect(completeSpy).toHaveBeenCalled()

      jest.useRealTimers()
    })
  })
})
