import { range } from 'fkit'

import Signal from '../Signal'
import delay from './delay'

let valueSpy, errorSpy, completeSpy

describe('delay', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('delays the signal values', () => {
    const s = Signal.fromArray(range(1, 3))

    delay(1000)(s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1000)

    expect(valueSpy).toHaveBeenCalledTimes(3)

    range(1, 3).forEach((n, index) => {
      expect(valueSpy.mock.calls[index][0]).toBe(n)
    }, this)

    expect(completeSpy).toHaveBeenCalled()
  })

  it('emits an error if the parent signal emits an error', () => {
    const mount = jest.fn(emit => emit.error())
    const s = new Signal(mount)

    delay(1000)(s).subscribe({ error: errorSpy })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = delay(1000)(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
