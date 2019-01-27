import events from 'events'
import { id, range } from 'fkit'

import Signal from './Signal'
import all from './combinators/all'
import any from './combinators/any'
import apply from './combinators/apply'
import concat from './combinators/concat'
import map from './combinators/map'
import merge from './combinators/merge'
import mockSignal from './internal/mockSignal'
import switchMap from './combinators/switchMap'
import take from './combinators/take'
import tuple from './internal/tuple'
import zipWith from './combinators/zipWith'
import { asap } from './scheduler'

jest.mock('./combinators/all')
jest.mock('./combinators/any')
jest.mock('./combinators/apply')
jest.mock('./combinators/concat')
jest.mock('./combinators/drop')
jest.mock('./combinators/map')
jest.mock('./combinators/merge')
jest.mock('./combinators/switchMap')
jest.mock('./combinators/take')
jest.mock('./combinators/zipWith')
jest.mock('./scheduler')

let valueSpy, errorSpy, completeSpy

describe('Signal', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    asap.mockImplementation(f => f())
  })

  afterEach(() => {
    asap.mockRestore()
  })

  describe('.concat', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      Signal.concat([s, t, u])
      expect(concat).toHaveBeenCalledWith([s, t, u])
    })

    it('handles multiple arguments', () => {
      Signal.concat(s, t, u)
      expect(concat).toHaveBeenCalledWith([s, t, u])
    })
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

  describe('.fromArray', () => {
    it('returns a signal that emits values from an array', () => {
      const s = Signal.fromArray(range(1, 3))

      s.subscribe(valueSpy, errorSpy, completeSpy)

      range(1, 3).forEach((n, index) => {
        expect(valueSpy.mock.calls[index][0]).toBe(n)
      }, this)

      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.fromCallback', () => {
    it('returns a signal that wraps a callback', () => {
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
    it('returns a signal that emits events', () => {
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
    it('returns a signal that wraps a promise', () => {
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

  describe('.merge', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      Signal.merge([s, t, u])
      expect(merge).toHaveBeenCalledWith([s, t, u])
    })

    it('handles multiple arguments', () => {
      Signal.merge(s, t, u)
      expect(merge).toHaveBeenCalledWith([s, t, u])
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
    it('returns a signal that emits a single value', () => {
      const s = Signal.of(1)

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(valueSpy).toHaveBeenCalledWith(1)
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.periodic', () => {
    it('returns a signal that periodically emits a value', () => {
      jest.useFakeTimers()

      const spy = jest.fn()
      const s = Signal.periodic(1000)

      s.subscribe(spy)

      jest.advanceTimersByTime(1000)
      expect(spy).toHaveBeenLastCalledWith(0)
      jest.advanceTimersByTime(1000)
      expect(spy).toHaveBeenLastCalledWith(1)
      jest.advanceTimersByTime(1000)
      expect(spy).toHaveBeenLastCalledWith(2)

      jest.useRealTimers()
    })
  })

  describe('.throwError', () => {
    it('returns a signal that throws an error', () => {
      const s = Signal.throwError('foo')

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(errorSpy).toHaveBeenCalledWith('foo')
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.zip', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      Signal.zip([s, t, u])
      expect(zipWith).toHaveBeenCalledWith(tuple, [s, t, u])
    })

    it('handles multiple arguments', () => {
      Signal.zip(s, t, u)
      expect(zipWith).toHaveBeenCalledWith(tuple, [s, t, u])
    })
  })

  describe('.zipWith', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()
    const f = jest.fn()

    it('handles an array', () => {
      Signal.zipWith(f, [s, t, u])
      expect(zipWith).toHaveBeenCalledWith(f, [s, t, u])
    })

    it('handles multiple arguments', () => {
      Signal.zipWith(f, s, t, u)
      expect(zipWith).toHaveBeenCalledWith(f, [s, t, u])
    })
  })

  describe('#append', () => {
    const s = mockSignal()
    const t = mockSignal()
    let spy

    beforeEach(() => {
      spy = jest.spyOn(Signal, 'fromArray').mockReturnValue(t)
    })

    afterEach(() => {
      spy.mockRestore()
    })

    it('handles an array', () => {
      s.append([1, 2, 3])
      expect(concat).toHaveBeenCalledWith([s, t])
      expect(spy).toHaveBeenCalledWith([1, 2, 3])
    })

    it('handles multiple arguments', () => {
      s.append(1, 2, 3)
      expect(concat).toHaveBeenCalledWith([s, t])
      expect(spy).toHaveBeenCalledWith([1, 2, 3])
    })
  })

  describe('#all', () => {
    it('calls the combinator', () => {
      const p = jest.fn()
      const s = mockSignal()
      s.all(p)
      expect(all).toHaveBeenCalledWith(p, s)
    })
  })

  describe('#any', () => {
    it('calls the combinator', () => {
      const p = jest.fn()
      const s = mockSignal()
      s.any(p)
      expect(any).toHaveBeenCalledWith(p, s)
    })
  })

  describe('#apply', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      s.apply([t, u])
      expect(apply).toHaveBeenCalledWith(s, [t, u])
    })

    it('handles multiple arguments', () => {
      s.apply(t, u)
      expect(apply).toHaveBeenCalledWith(s, [t, u])
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

  describe('#encode', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()
    let spy

    beforeEach(() => {
      spy = map.mockImplementation((f, s) => f(0))
    })

    afterEach(() => {
      spy.mockRestore()
    })

    it('handles an array', () => {
      s.encode([t, u])

      expect(spy).toHaveBeenCalledWith(expect.any(Function), s)
      expect(switchMap).toHaveBeenCalledWith(id, t)
    })

    it('handles multiple arguments', () => {
      s.encode(t, u)

      expect(spy).toHaveBeenCalledWith(expect.any(Function), s)
      expect(switchMap).toHaveBeenCalledWith(id, t)
    })
  })

  describe('#endWith', () => {
    const s = mockSignal()
    const t = mockSignal()
    let spy

    beforeEach(() => {
      spy = jest.spyOn(Signal, 'of').mockReturnValue(t)
    })

    afterEach(() => {
      spy.mockRestore()
    })

    it('appends the given value', () => {
      s.endWith(1)
      expect(spy).toHaveBeenCalledWith(1)
      expect(concat).toHaveBeenCalledWith([s, t])
    })
  })

  describe('#first', () => {
    it('calls take', () => {
      const s = mockSignal()
      s.first()
      expect(take).toHaveBeenCalledWith(1, s)
    })
  })

  describe('#last', () => {
    it('emits the last value', () => {
      const s = mockSignal()

      s.last().subscribe(valueSpy, errorSpy, completeSpy)

      s.value(1)
      s.value(2)
      s.value(3)
      s.complete()
      expect(valueSpy).toHaveBeenCalledTimes(1)
      expect(valueSpy).toHaveBeenCalledWith(3)
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

  describe('#prepend', () => {
    const s = mockSignal()
    const t = mockSignal()
    let spy

    beforeEach(() => {
      spy = jest.spyOn(Signal, 'fromArray').mockReturnValue(t)
    })

    afterEach(() => {
      spy.mockRestore()
    })

    it('handles an array', () => {
      s.prepend([1, 2, 3])
      expect(spy).toHaveBeenCalledWith([1, 2, 3])
      expect(concat).toHaveBeenCalledWith([t, s])
    })

    it('handles multiple arguments', () => {
      s.prepend(1, 2, 3)
      expect(spy).toHaveBeenCalledWith([1, 2, 3])
      expect(concat).toHaveBeenCalledWith([t, s])
    })
  })

  describe('#startWith', () => {
    const s = mockSignal()
    const t = mockSignal()
    let spy

    beforeEach(() => {
      spy = jest.spyOn(Signal, 'of').mockReturnValue(t)
    })

    afterEach(() => {
      spy.mockRestore()
    })

    it('prepends the given value', () => {
      s.startWith(1)
      expect(spy).toHaveBeenCalledWith(1)
      expect(concat).toHaveBeenCalledWith([t, s])
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

    it('calls the complete callback when the signal is complete', () => {
      const s = mockSignal()

      s.subscribe(valueSpy, errorSpy, completeSpy)

      expect(completeSpy).not.toHaveBeenCalled()
      s.complete()
      expect(completeSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#switchLatest', () => {
    it('calls switchMap', () => {
      const s = mockSignal()
      s.switchLatest()
      expect(switchMap).toHaveBeenCalledWith(id, s)
    })
  })

  describe('#zip', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      s.zip([t, u])
      expect(zipWith).toHaveBeenCalledWith(tuple, [s, t, u])
    })

    it('handles multiple arguments', () => {
      s.zip(t, u)
      expect(zipWith).toHaveBeenCalledWith(tuple, [s, t, u])
    })
  })

  describe('#zipWith', () => {
    const f = jest.fn()
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    it('handles an array', () => {
      s.zipWith(f, [t, u])
      expect(zipWith).toHaveBeenCalledWith(f, [s, t, u])
    })

    it('handles multiple arguments', () => {
      s.zipWith(f, t, u)
      expect(zipWith).toHaveBeenCalledWith(f, [s, t, u])
    })
  })
})
