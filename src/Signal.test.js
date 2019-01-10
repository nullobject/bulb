import events from 'events'
import { range } from 'fkit'

import Signal from './Signal'
import concat from './combinators/concat'
import merge from './combinators/merge'
import { append } from './combinators/append'
import { asap } from './scheduler'
import { mockSignal } from './emitter'
import { prepend } from './combinators/prepend'

jest.mock('./combinators/append')
jest.mock('./combinators/concat')
jest.mock('./combinators/merge')
jest.mock('./combinators/prepend')
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
      let value
      const s = Signal.fromCallback(callback => {
        value = a => { callback(null, a) }
      })

      s.subscribe(valueSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        value(n)
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
      const s = mockSignal()
      const a = s.subscribe()
      const b = s.subscribe()

      a.unsubscribe()
      expect(s.unmount).not.toHaveBeenCalled()
      b.unsubscribe()
      expect(s.unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the unmount function when the signal is complete', () => {
      const s = mockSignal()

      s.subscribe()

      expect(s.unmount).not.toHaveBeenCalled()
      s.complete()
      expect(s.unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the value callback when the signal emits a value', () => {
      const s = mockSignal()

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(valueSpy).not.toHaveBeenCalled()
      s.value('foo')
      expect(valueSpy).toHaveBeenCalledWith('foo')
    })

    it('calls the error callback when the signal emits an error', () => {
      const s = mockSignal()

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(errorSpy).not.toHaveBeenCalled()
      s.error('foo')
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
      const s = mockSignal()

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(completeSpy).not.toHaveBeenCalled()
      s.complete()
      expect(completeSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#append', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      s.append([t, u])
      expect(append).toHaveBeenCalledWith([t, u], s)
    })

    it('handles multiple arguments', () => {
      s.append(t, u)
      expect(append).toHaveBeenCalledWith([t, u], s)
    })
  })

  describe('#prepend', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      s.prepend([t, u])
      expect(prepend).toHaveBeenCalledWith([t, u], s)
    })

    it('handles multiple arguments', () => {
      s.prepend(t, u)
      expect(prepend).toHaveBeenCalledWith([t, u], s)
    })
  })

  describe('#startWith', () => {
    it('calls concat', () => {
      const s = mockSignal()
      const t = mockSignal()
      const spy = jest.spyOn(Signal, 'of').mockReturnValue(t)

      s.startWith(0)

      expect(spy).toHaveBeenCalledWith(0)
      expect(concat).toHaveBeenCalledWith(t, s)

      spy.mockRestore()
    })
  })

  describe('#concat', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      s.concat([t, u])
      expect(concat).toHaveBeenCalledWith([s, t, u])
    })

    it('handles multiple arguments', () => {
      s.concat(t, u)
      expect(concat).toHaveBeenCalledWith([s, t, u])
    })
  })

  describe('#merge', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      s.merge([t, u])
      expect(merge).toHaveBeenCalledWith([s, t, u])
    })

    it('handles multiple arguments', () => {
      s.merge(t, u)
      expect(merge).toHaveBeenCalledWith([s, t, u])
    })
  })
})
