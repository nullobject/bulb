import eq from 'fkit/dist/_eq'
import events from 'events'
import id from 'fkit/dist/id'
import tuple from 'fkit/dist/tuple'

import Signal from './Signal'
import all from './combinators/all'
import always from './combinators/always'
import any from './combinators/any'
import apply from './combinators/apply'
import buffer from './combinators/buffer'
import catchError from './combinators/catchError'
import concat from './combinators/concat'
import concatMap from './combinators/concatMap'
import cycle from './combinators/cycle'
import debounce from './combinators/debounce'
import dedupeWith from './combinators/dedupeWith'
import delay from './combinators/delay'
import drop from './combinators/drop'
import dropUntil from './combinators/dropUntil'
import dropWhile from './combinators/dropWhile'
import map from './combinators/map'
import merge from './combinators/merge'
import mockSignal from './internal/mockSignal'
import sample from './combinators/sample'
import scan from './combinators/scan'
import sequential from './combinators/sequential'
import stateMachine from './combinators/stateMachine'
import switchMap from './combinators/switchMap'
import take from './combinators/take'
import takeUntil from './combinators/takeUntil'
import takeWhile from './combinators/takeWhile'
import throttle from './combinators/throttle'
import zipWith from './combinators/zipWith'
import { asap } from './scheduler'

jest.mock('./combinators/all', () => jest.fn(() => () => {}))
jest.mock('./combinators/always', () => jest.fn(() => () => {}))
jest.mock('./combinators/any', () => jest.fn(() => () => {}))
jest.mock('./combinators/apply', () => jest.fn(() => () => {}))
jest.mock('./combinators/buffer', () => jest.fn(() => () => {}))
jest.mock('./combinators/catchError', () => jest.fn(() => () => {}))
jest.mock('./combinators/concat', () => jest.fn(() => () => {}))
jest.mock('./combinators/concatMap', () => jest.fn(() => () => {}))
jest.mock('./combinators/cycle', () => jest.fn(() => () => {}))
jest.mock('./combinators/debounce', () => jest.fn(() => () => {}))
jest.mock('./combinators/dedupeWith', () => jest.fn(() => () => {}))
jest.mock('./combinators/delay', () => jest.fn(() => () => {}))
jest.mock('./combinators/drop', () => jest.fn(() => () => {}))
jest.mock('./combinators/dropUntil', () => jest.fn(() => () => {}))
jest.mock('./combinators/dropWhile', () => jest.fn(() => () => {}))
jest.mock('./combinators/map', () => jest.fn(() => () => {}))
jest.mock('./combinators/merge', () => jest.fn(() => () => {}))
jest.mock('./combinators/sample', () => jest.fn(() => () => {}))
jest.mock('./combinators/scan', () => jest.fn(() => () => {}))
jest.mock('./combinators/sequential', () => jest.fn(() => () => {}))
jest.mock('./combinators/stateMachine', () => jest.fn(() => () => {}))
jest.mock('./combinators/switchMap', () => jest.fn(() => () => {}))
jest.mock('./combinators/take', () => jest.fn(() => () => {}))
jest.mock('./combinators/takeUntil', () => jest.fn(() => () => {}))
jest.mock('./combinators/takeWhile', () => jest.fn(() => () => {}))
jest.mock('./combinators/throttle', () => jest.fn(() => () => {}))
jest.mock('./combinators/zipWith', () => jest.fn(() => () => {}))
jest.mock('./scheduler')

let nextSpy, errorSpy, completeSpy

describe('Signal', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    asap.mockImplementation(f => f())
  })

  describe('.concat', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      Signal.concat(s, t, u)

      expect(concat).toHaveBeenLastCalledWith([s, t, u])
    })
  })

  describe('.empty', () => {
    it('returns a signal that has already completed', () => {
      const s = Signal.empty()

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.from', () => {
    it('returns a signal that emits values from an array', () => {
      const s = Signal.from([1, 2, 3])

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).toHaveBeenCalledTimes(3)
      expect(nextSpy).toHaveBeenNthCalledWith(1, 1)
      expect(nextSpy).toHaveBeenNthCalledWith(2, 2)
      expect(nextSpy).toHaveBeenNthCalledWith(3, 3)
      expect(completeSpy).toHaveBeenCalled()
    })

    it('returns a signal that emits values from a string', () => {
      const s = Signal.from('foo')

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).toHaveBeenCalledTimes(3)
      expect(nextSpy).toHaveBeenNthCalledWith(1, 'f')
      expect(nextSpy).toHaveBeenNthCalledWith(2, 'o')
      expect(nextSpy).toHaveBeenNthCalledWith(3, 'o')
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.fromCallback', () => {
    it('returns a signal that wraps a callback', () => {
      let next
      const s = Signal.fromCallback(callback => {
        next = a => { callback(null, a) }
      })

      s.subscribe(nextSpy, errorSpy, completeSpy)

      next(1)
      expect(nextSpy).toHaveBeenLastCalledWith(1)
      next(2)
      expect(nextSpy).toHaveBeenLastCalledWith(2)
      next(3)
      expect(nextSpy).toHaveBeenLastCalledWith(3)
      expect(completeSpy).not.toHaveBeenCalled()
    })
  })

  describe('.fromEvent', () => {
    it('returns a signal that emits events', () => {
      const emitter = new events.EventEmitter()
      const s = Signal.fromEvent('lol', emitter)

      s.subscribe(nextSpy, errorSpy, completeSpy)

      emitter.emit('lol', 1)
      expect(nextSpy).toHaveBeenLastCalledWith(1)
      emitter.emit('lol', 2)
      expect(nextSpy).toHaveBeenLastCalledWith(2)
      emitter.emit('lol', 3)
      expect(nextSpy).toHaveBeenLastCalledWith(3)
      expect(completeSpy).not.toHaveBeenCalled()
    })
  })

  describe('.fromPromise', () => {
    it('returns a signal that wraps a promise', () => {
      let next, complete

      const s = Signal.fromPromise({
        then: onFulfilled => {
          next = onFulfilled
          return {
            finally: onFinally => { complete = onFinally }
          }
        }
      })

      s.subscribe(nextSpy, errorSpy, completeSpy)

      next(1)
      expect(nextSpy).toHaveBeenLastCalledWith(1)
      next(2)
      expect(nextSpy).toHaveBeenLastCalledWith(2)
      next(3)
      expect(nextSpy).toHaveBeenLastCalledWith(3)
      complete()
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.merge', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      Signal.merge(s, t, u)

      expect(merge).toHaveBeenLastCalledWith([s, t, u])
    })
  })

  describe('.never', () => {
    it('returns a signal that never completes', () => {
      const s = Signal.never()

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).not.toHaveBeenCalled()
      expect(errorSpy).not.toHaveBeenCalled()
      expect(completeSpy).not.toHaveBeenCalled()
    })
  })

  describe('.of', () => {
    it('returns a signal that emits the given values', () => {
      const s = Signal.of(1, 2, 3)

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).toHaveBeenNthCalledWith(1, 1)
      expect(nextSpy).toHaveBeenNthCalledWith(2, 2)
      expect(nextSpy).toHaveBeenNthCalledWith(3, 3)
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

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(errorSpy).toHaveBeenLastCalledWith('foo')
      expect(completeSpy).toHaveBeenCalled()
    })
  })

  describe('.zip', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      Signal.zip(s, t, u)

      expect(zipWith).toHaveBeenLastCalledWith(tuple, [s, t, u])
    })
  })

  describe('.zipWith', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()
      const f = jest.fn()

      Signal.zipWith(f, s, t, u)

      expect(zipWith).toHaveBeenLastCalledWith(f, [s, t, u])
    })
  })

  describe('#all', () => {
    it('calls the combinator', () => {
      const p = jest.fn()
      const s = mockSignal()

      s.all(p)

      expect(all).toHaveBeenLastCalledWith(p, s)
    })
  })

  describe('#always', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.always(1)

      expect(always).toHaveBeenLastCalledWith(1, s)
    })
  })

  describe('#any', () => {
    it('calls the combinator', () => {
      const p = jest.fn()
      const s = mockSignal()

      s.any(p)

      expect(any).toHaveBeenLastCalledWith(p, s)
    })
  })

  describe('#append', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const spy = jest.spyOn(Signal, 'from').mockReturnValue(t)

      s.append(1, 2, 3)

      expect(concat).toHaveBeenLastCalledWith([s, t])
      expect(spy).toHaveBeenLastCalledWith([1, 2, 3])
    })
  })

  describe('#apply', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      s.apply(t, u)

      expect(apply).toHaveBeenLastCalledWith(s, [t, u])
    })
  })

  describe('#buffer', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.buffer(1)

      expect(buffer).toHaveBeenLastCalledWith(1, s)
    })
  })

  describe('#catchError', () => {
    it('calls the combinator', () => {
      const f = jest.fn()
      const s = mockSignal()

      s.catchError(f)

      expect(catchError).toHaveBeenLastCalledWith(f, s)
    })
  })

  describe('#concat', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      s.concat(t, u)

      expect(concat).toHaveBeenLastCalledWith([s, t, u])
    })
  })

  describe('#concatMap', () => {
    it('calls the combinator', () => {
      const f = jest.fn()
      const s = mockSignal()

      s.concatMap(f)

      expect(concatMap).toHaveBeenLastCalledWith(f, s)
    })
  })

  describe('#cycle', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.cycle(1, 2, 3)

      expect(cycle).toHaveBeenLastCalledWith([1, 2, 3], s)
    })
  })

  describe('#debounce', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.debounce(1)

      expect(debounce).toHaveBeenLastCalledWith(1, s)
    })
  })

  describe('#dedupe', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.dedupe()

      expect(dedupeWith).toHaveBeenLastCalledWith(eq, s)
    })
  })

  describe('#dedupeWith', () => {
    it('calls the combinator', () => {
      const f = jest.fn()
      const s = mockSignal()

      s.dedupeWith(f)

      expect(dedupeWith).toHaveBeenLastCalledWith(f, s)
    })
  })

  describe('#delay', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.delay(1)

      expect(delay).toHaveBeenLastCalledWith(1, s)
    })
  })

  describe('#drop', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.drop(1)

      expect(drop).toHaveBeenLastCalledWith(1, s)
    })
  })

  describe('#dropUntil', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()

      s.dropUntil(t)

      expect(dropUntil).toHaveBeenLastCalledWith(t, s)
    })
  })

  describe('#dropWhile', () => {
    it('calls the combinator', () => {
      const p = jest.fn()
      const s = mockSignal()

      s.dropWhile(p)

      expect(dropWhile).toHaveBeenLastCalledWith(p, s)
    })
  })

  describe('#encode', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      s.encode(t, u)

      expect(map).toHaveBeenLastCalledWith(expect.any(Function), s)
    })
  })

  describe('#endWith', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const spy = jest.spyOn(Signal, 'of').mockReturnValue(t)

      s.endWith(1)

      expect(spy).toHaveBeenLastCalledWith(1)
      expect(concat).toHaveBeenLastCalledWith([s, t])
    })
  })

  describe('#first', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.first()

      expect(take).toHaveBeenLastCalledWith(1, s)
    })
  })

  describe('#last', () => {
    it('emits the last value', () => {
      const s = mockSignal()

      s.last().subscribe(nextSpy, errorSpy, completeSpy)

      s.next(1)
      s.next(2)
      s.next(3)
      s.complete()
      expect(nextSpy).toHaveBeenCalledTimes(1)
      expect(nextSpy).toHaveBeenLastCalledWith(3)
    })
  })

  describe('#map', () => {
    it('calls the combinator', () => {
      const f = jest.fn()
      const s = mockSignal()

      s.map(f)

      expect(map).toHaveBeenLastCalledWith(f, s)
    })
  })

  describe('#merge', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      s.merge(t, u)

      expect(merge).toHaveBeenLastCalledWith([s, t, u])
    })
  })

  describe('#prepend', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const spy = jest.spyOn(Signal, 'from').mockReturnValue(t)

      s.prepend(1, 2, 3)

      expect(spy).toHaveBeenLastCalledWith([1, 2, 3])
      expect(concat).toHaveBeenLastCalledWith([t, s])
    })
  })

  describe('#sample', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()

      s.sample(t)

      expect(sample).toHaveBeenLastCalledWith(t, s)
    })
  })

  describe('#scan', () => {
    it('calls the combinator', () => {
      const f = jest.fn()
      const s = mockSignal()

      s.scan(f, 1)

      expect(scan).toHaveBeenLastCalledWith(f, 1, s)
    })
  })

  describe('#sequential', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.sequential(1, 2, 3)

      expect(sequential).toHaveBeenLastCalledWith([1, 2, 3], s)
    })
  })

  describe('#startWith', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const spy = jest.spyOn(Signal, 'of').mockReturnValue(t)

      s.startWith(1)

      expect(spy).toHaveBeenLastCalledWith(1)
      expect(concat).toHaveBeenLastCalledWith([t, s])
    })
  })

  describe('#stateMachine', () => {
    it('calls the combinator', () => {
      const f = jest.fn()
      const s = mockSignal()

      s.stateMachine(f, 1)

      expect(stateMachine).toHaveBeenLastCalledWith(f, 1, s)
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

    it('only calls the unmount function once', () => {
      const s = mockSignal()
      const a = s.subscribe()

      a.unsubscribe()
      a.unsubscribe()
      expect(s.unmount).toHaveBeenCalledTimes(1)
    })

    it('marks the subscriber as closed when they unsubscribe', () => {
      const s = mockSignal()
      const a = s.subscribe()

      expect(a.closed).toBe(false)
      a.unsubscribe()
      expect(a.closed).toBe(true)
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

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).not.toHaveBeenCalled()
      s.next('foo')
      expect(nextSpy).toHaveBeenLastCalledWith('foo')
    })

    it('calls the error callback when the signal emits an error', () => {
      const s = mockSignal()

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(errorSpy).not.toHaveBeenCalled()
      s.error('foo')
      expect(errorSpy).toHaveBeenLastCalledWith('foo')
    })

    it('calls the complete callback when the signal has completed', () => {
      const s = mockSignal()

      s.subscribe(nextSpy, errorSpy, completeSpy)

      expect(completeSpy).not.toHaveBeenCalled()
      s.complete()
      expect(completeSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#switchLatest', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.switchLatest()

      expect(switchMap).toHaveBeenLastCalledWith(id, s)
    })
  })

  describe('#take', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.take(1)

      expect(take).toHaveBeenLastCalledWith(1, s)
    })
  })

  describe('#takeUntil', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()

      s.takeUntil(t)

      expect(takeUntil).toHaveBeenLastCalledWith(t, s)
    })
  })

  describe('#takeWhile', () => {
    it('calls the combinator', () => {
      const p = jest.fn()
      const s = mockSignal()

      s.takeWhile(p)

      expect(takeWhile).toHaveBeenLastCalledWith(p, s)
    })
  })

  describe('#throttle', () => {
    it('calls the combinator', () => {
      const s = mockSignal()

      s.throttle(1)

      expect(throttle).toHaveBeenLastCalledWith(1, s)
    })
  })

  describe('#zip', () => {
    it('calls the combinator', () => {
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      s.zip(t, u)

      expect(zipWith).toHaveBeenLastCalledWith(tuple, [s, t, u])
    })
  })

  describe('#zipWith', () => {
    it('calls the combinator', () => {
      const f = jest.fn()
      const s = mockSignal()
      const t = mockSignal()
      const u = mockSignal()

      s.zipWith(f, t, u)

      expect(zipWith).toHaveBeenLastCalledWith(f, [s, t, u])
    })
  })
})
