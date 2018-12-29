import { add, always, range } from 'fkit'

import Signal from '../../src/Signal'
import { fold, scan, stateMachine } from '../../src/combinators/fold'

let nextSpy, errorSpy, completeSpy

describe('fold', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  describe('#fold', () => {
    it('folds a function over the signal values', done => {
      const s = Signal.fromArray(range(1, 3))

      fold(add)(0)(s).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        expect(nextSpy).toBeCalledWith(6)
        expect(completeSpy).toBeCalled()
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      fold(always())(0)(s).subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const a = fold(always())(0)(s).subscribe()

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })
  })

  describe('#scan', () => {
    it('scans a function over the signal values', done => {
      const s = Signal.fromArray(range(1, 3))

      scan(add)(0)(s).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        [0, 1, 3, 6].forEach((n, index) => {
          expect(nextSpy.mock.calls[index][0]).toBe(n)
        }, this)

        expect(completeSpy).toHaveBeenCalled()
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      scan(always())(0)(s).subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#stateMachine', () => {
    it('iterates a function over the signal values', done => {
      const s = Signal.fromArray(range(1, 3))

      stateMachine((a, b, emit) => {
        emit.next(a * b)
        return a + b
      })(0)(s).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        [0, 2, 9].forEach((n, index) => {
          expect(nextSpy.mock.calls[index][0]).toBe(n)
        }, this)

        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      stateMachine(always())(0)(s).subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const a = stateMachine(always())(0)(s).subscribe()

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })
  })
})
