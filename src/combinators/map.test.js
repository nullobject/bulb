import { always, inc, range } from 'fkit'

import Signal from '../Signal'
import map from './map'

let valueSpy, errorSpy, completeSpy

describe('map', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('maps a function over the signal values', () => {
    const s = Signal.fromArray(range(1, 3))

    map(inc)(s).subscribe(valueSpy, errorSpy, completeSpy)

    range(2, 3).forEach((n, index) => {
      expect(valueSpy.mock.calls[index][0]).toBe(n)
    }, this)

    expect(completeSpy).toHaveBeenCalled()
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
