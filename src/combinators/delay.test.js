import { range } from 'fkit'

import Signal from '../../src/Signal'
import { debounce, delay, throttle } from '../../src/combinators/delay'

let nextSpy, errorSpy, completeSpy

describe('delay', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('#delay', () => {
    it('delays the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      delay(1000)(s).subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)

      expect(nextSpy).toHaveBeenCalledTimes(3)

      range(1, 3).forEach((n, index) => {
        expect(nextSpy.mock.calls[index][0]).toBe(n)
      }, this)

      expect(completeSpy).toHaveBeenCalled()
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      delay(1000)(s).subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#debounce', () => {
    it('debounces the signal values', () => {
      const s = Signal.sequential(100, range(1, 3))

      debounce(1000)(s).subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)

      expect(nextSpy).toHaveBeenCalledTimes(1)
      expect(nextSpy).toHaveBeenCalledWith(3)

      expect(completeSpy).toHaveBeenCalled()
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      debounce(1000)(s).subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#throttle', () => {
    it('throttle the signal values', () => {
      const s = Signal.sequential(500, range(1, 3))

      throttle(1000)(s).subscribe(nextSpy, errorSpy, completeSpy)

      expect(nextSpy).not.toHaveBeenCalled()

      Date.now = jest.fn(() => 0)
      jest.advanceTimersByTime(500)
      Date.now = jest.fn(() => 1000)
      jest.advanceTimersByTime(500)
      Date.now = jest.fn(() => 1500)
      jest.advanceTimersByTime(500)
      Date.now.mockRestore()

      expect(nextSpy).toHaveBeenCalledTimes(2)

      range(1, 2).forEach((n, index) => {
        expect(nextSpy.mock.calls[index][0]).toBe(n)
      }, this)

      expect(completeSpy).toHaveBeenCalled()
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = jest.fn(emit => emit.error())
      const s = new Signal(mount)

      throttle(1000)(s).subscribe({ error: errorSpy })
      expect(errorSpy).toHaveBeenCalledTimes(1)
    })
  })
})
