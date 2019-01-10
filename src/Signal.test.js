import events from 'events'
import { range } from 'fkit'

import Signal from './Signal'
import { asap } from './scheduler'

jest.mock('./scheduler')

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
    beforeEach(() => {
      asap.mockImplementation(f => f())
    })

    afterEach(() => {
      asap.mockRestore()
    })

    it('returns a signal with a single value', () => {
      const s = Signal.of(1)

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(valueSpy).toHaveBeenCalledWith(1)
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.fromArray', () => {
    beforeEach(() => {
      asap.mockImplementation(f => f())
    })

    afterEach(() => {
      asap.mockRestore()
    })

    it('returns a signal of values from an array', () => {
      const s = Signal.fromArray(range(1, 3))

      s.subscribe(valueSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        expect(valueSpy.mock.calls[index][0]).toBe(n)
      }, this)

      expect(completeSpy).toHaveBeenCalled()
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

    it('calls the unmount function when the signal is complete', () => {
      let complete
      const unmount = jest.fn()
      const s = new Signal(emit => {
        complete = () => { emit.complete() }
        return unmount
      })

      s.subscribe()
      complete()
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

      s.subscribe(valueSpy, errorSpy, completeSpy)
      expect(errorSpy).toHaveBeenCalledWith('foo')
    })

    it('calls the error callback when the signal raises an error', () => {
      const error = new Error('foo')
      const mount = jest.fn(() => {
        throw error
      })
      const s = new Signal(mount)

      s.subscribe(valueSpy, errorSpy, completeSpy)
      expect(errorSpy).toHaveBeenCalledWith(error)
    })

    it('calls the complete callback when the signal is complete', () => {
      const mount = jest.fn(emit => emit.complete())
      const s = new Signal(mount)

      s.subscribe({ complete: completeSpy })
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('#always', () => {
    it('replaces signal values with a constant', () => {
      let value
      const s = new Signal(emit => {
        value = emit.value
      })

      s.always(0).subscribe(valueSpy, errorSpy, completeSpy)

      expect(valueSpy).not.toHaveBeenCalled()
      value(1)
      expect(valueSpy).toHaveBeenCalledTimes(1)
      expect(valueSpy).toHaveBeenCalledWith(0)
      value(2)
      expect(valueSpy).toHaveBeenCalledTimes(2)
      expect(valueSpy).toHaveBeenCalledWith(0)
      value(3)
      expect(valueSpy).toHaveBeenCalledTimes(3)
      expect(valueSpy).toHaveBeenCalledWith(0)
    })

    it('emits an error when the given signal emits an error', () => {
      let error
      const s = new Signal(emit => {
        error = emit.error
      })

      s.always(0).subscribe(valueSpy, errorSpy, completeSpy)

      expect(errorSpy).not.toHaveBeenCalled()
      error('foo')
      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledWith('foo')
    })

    it('completes when the given signal is completed', () => {
      let complete
      const s = new Signal(emit => {
        complete = emit.complete
      })

      s.always(0).subscribe(valueSpy, errorSpy, completeSpy)

      expect(completeSpy).not.toHaveBeenCalled()
      complete()
      expect(completeSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#startWith', () => {
    beforeEach(() => {
      asap.mockImplementation(f => f())
    })

    afterEach(() => {
      asap.mockRestore()
    })

    it('emits the given value before all other values', () => {
      let value
      const s = new Signal(emit => {
        value = emit.value
      })

      s.startWith(1).subscribe(valueSpy, errorSpy, completeSpy)

      expect(valueSpy).toHaveBeenCalledTimes(1)
      expect(valueSpy).toHaveBeenCalledWith(1)
      value(2)
      expect(valueSpy).toHaveBeenCalledTimes(2)
      expect(valueSpy).toHaveBeenCalledWith(2)
    })

    it('emits an error when the given signal emits an error', () => {
      let error
      const s = new Signal(emit => {
        error = emit.error
      })

      s.startWith(0).subscribe(valueSpy, errorSpy, completeSpy)

      expect(errorSpy).not.toHaveBeenCalled()
      error('foo')
      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledWith('foo')
    })

    it('completes when the given signal is completed', () => {
      let complete
      const s = new Signal(emit => {
        complete = emit.complete
      })

      s.startWith(0).subscribe(valueSpy, errorSpy, completeSpy)

      expect(completeSpy).not.toHaveBeenCalled()
      complete()
      expect(completeSpy).toHaveBeenCalledTimes(1)
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
