import { range } from 'fkit'

import Signal from '../../src/Signal'
import { merge } from '../../src/combinators/merge'

let nextSpy, errorSpy, completeSpy

describe('merge', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('#merge', () => {
    it('merges the signals', () => {
      const s = Signal.sequential(1000, range(1, 3))
      const t = Signal.sequential(1000, range(4, 3))
      const u = Signal.sequential(1000, range(7, 3))

      merge(s, t, u).subscribe(nextSpy, errorSpy, completeSpy)

      jest.advanceTimersByTime(1000)
      jest.advanceTimersByTime(1000)
      jest.advanceTimersByTime(1000)

      expect(nextSpy).toHaveBeenCalledTimes(9);

      [1, 4, 7, 2, 5, 8, 3, 6, 9].forEach((n, index) => {
        expect(nextSpy.mock.calls[index][0]).toBe(n)
      }, this)

      expect(completeSpy).toHaveBeenCalled()
    })

    it('emits an error if either signal emits an error', () => {
      let a, b
      const s = Signal.fromCallback(callback => {
        a = e => { callback(e) }
      })
      const t = Signal.fromCallback(callback => {
        b = e => { callback(e) }
      })

      merge(s, t).subscribe({ error: errorSpy })

      a('foo')
      b('foo')

      expect(errorSpy).toHaveBeenCalledTimes(2)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const t = Signal.never()
      const a = merge(s, t).subscribe()

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })

    it('unmounts the merged signals when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = Signal.never()
      const t = new Signal(() => unmount)
      const u = new Signal(() => unmount)
      const a = merge(s, t, u).subscribe()

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(2)
    })
  })
})
