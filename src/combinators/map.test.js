import { always, inc, range } from 'fkit'

import Signal from '../../src/Signal'
import { concatMap, map } from '../../src/combinators/map'

let nextSpy, errorSpy, completeSpy

describe('map', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  describe('#concatMap', () => {
    it('maps a function over the signal values', done => {
      const s = Signal.fromArray(range(1, 3))
      const f = a => Signal.of(a)

      concatMap(f)(s).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        range(1, 3).forEach((n, index) => {
          expect(nextSpy.mock.calls[index][0]).toBe(n)
        }, this)

        expect(completeSpy).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      concatMap(always())(s).subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const f = a => Signal.of(a)
      const a = concatMap(f)(s).subscribe()

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })

    it('unmounts the returned signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = Signal.of(0)
      const f = a => new Signal(() => unmount)
      const a = concatMap(f)(s).subscribe()

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })
  })

  describe('#map', () => {
    it('maps a function over the signal values', done => {
      const s = Signal.fromArray(range(1, 3))

      map(inc)(s).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        range(2, 3).forEach((n, index) => {
          expect(nextSpy.mock.calls[index][0]).toBe(n)
        }, this)

        expect(completeSpy).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      map(always())(s).subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const a = map(always())(s).subscribe()

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })
  })
})
