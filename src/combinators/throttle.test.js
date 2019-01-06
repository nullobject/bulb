import { range } from 'fkit'

import Signal from '../Signal'
import throttle from './throttle'

let valueSpy, errorSpy, completeSpy

describe('#throttle', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('throttle the signal values', () => {
    const s = Signal.periodic(500).sequential(range(1, 3))

    throttle(1000)(s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()

    Date.now = jest.fn(() => 0)
    jest.advanceTimersByTime(500)
    Date.now = jest.fn(() => 1000)
    jest.advanceTimersByTime(500)
    Date.now = jest.fn(() => 1500)
    jest.advanceTimersByTime(500)
    Date.now.mockRestore()

    expect(valueSpy).toHaveBeenCalledTimes(2)

    range(1, 2).forEach((n, index) => {
      expect(valueSpy.mock.calls[index][0]).toBe(n)
    }, this)

    expect(completeSpy).toHaveBeenCalled()
  })

  it('emits an error if the parent signal emits an error', () => {
    const mount = jest.fn(emit => emit.error())
    const s = new Signal(mount)

    throttle(1000)(s).subscribe({ error: errorSpy })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = throttle(1000)(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
