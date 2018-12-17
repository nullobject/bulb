import { always, range } from 'fkit'

import Signal from '../../src/signal'
import { zip, zipWith } from '../../src/combinators/zip'

let nextSpy, errorSpy, completeSpy

describe('zip', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  describe('#zip', () => {
    it('zips the corresponding signal values into tuples', done => {
      const s = Signal.fromArray(range(1, 3))
      const t = Signal.fromArray(range(4, 3))
      const u = Signal.fromArray(range(7, 3))

      zip(s, t, u).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        expect(nextSpy).toHaveBeenCalledTimes(3);

        [[1, 4, 7], [2, 5, 8], [3, 6, 9]].forEach((ns, index) => {
          expect(nextSpy.mock.calls[index][0]).toEqual(ns)
        }, this)

        expect(completeSpy).toHaveBeenCalled()
        done()
      }, 0)
    })
  })

  describe('#zipWith', () => {
    it('zip the corresponding signal values with a function', done => {
      const s = Signal.fromArray(range(1, 3))
      const t = Signal.fromArray(range(4, 3))
      const u = Signal.fromArray(range(7, 3))
      const f = (a, b, c) => a + b + c

      zipWith(f, s, t, u).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        expect(nextSpy).toHaveBeenCalledTimes(3);

        [12, 15, 18].forEach((ns, index) => {
          expect(nextSpy.mock.calls[index][0]).toEqual(ns)
        }, this)

        expect(completeSpy).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('emits an error if either signal emits an error', () => {
      let a, b
      const s = Signal.fromCallback(callback => {
        a = e => { callback(e) }
      })
      const t = Signal.fromCallback(callback => {
        b = e => { callback(e) }
      })

      zipWith(always(), s, t).subscribe({ error: errorSpy })

      a('foo')
      b('foo')

      expect(errorSpy).toHaveBeenCalledTimes(2)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const t = Signal.never()
      const a = zipWith(always(), s, t).subscribe(always())

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })

    it('unmounts the zipped signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = Signal.never()
      const t = new Signal(() => unmount)
      const a = zipWith(always(), s, t).subscribe(always())

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })
  })
})
