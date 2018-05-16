import Signal from '../../src/signal'
import {always, equal, range} from 'fkit'
import {dedupe, dedupeWith, filter} from '../../src/combinators/filter'

let nextSpy, errorSpy, completeSpy

describe('filter', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  describe('#filter', () => {
    it('filters the signal values with a predicate', done => {
      const s = Signal.fromArray(range(1, 3))

      filter(equal(2))(s).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        expect(nextSpy).toBeCalledWith(2)
        expect(completeSpy).toBeCalled()
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      filter(always())(s).subscribe({error: errorSpy})
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#dedupe', () => {
    it('removes duplicate values from the signal', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })

      dedupe(s).subscribe(nextSpy, errorSpy, completeSpy)

      a('foo')
      a('foo')
      expect(nextSpy).toHaveBeenCalledTimes(1)
      expect(nextSpy).toHaveBeenLastCalledWith('foo')

      a('bar')
      expect(nextSpy).toHaveBeenLastCalledWith('bar')
    })
  })

  describe('#dedupeWith', () => {
    it('removes duplicate values from the signal using a comparator function', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })

      dedupeWith(equal)(s).subscribe(nextSpy, errorSpy, completeSpy)

      a('foo')
      a('foo')
      expect(nextSpy).toHaveBeenCalledTimes(1)
      expect(nextSpy).toHaveBeenLastCalledWith('foo')

      a('bar')
      expect(nextSpy).toHaveBeenLastCalledWith('bar')
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      dedupeWith(equal)(s).subscribe({error: errorSpy})
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })
})
