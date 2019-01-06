import { add, always, range } from 'fkit'

import Signal from '../Signal'
import scan from './scan'

let valueSpy, errorSpy, completeSpy

describe('#scan', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('scans a function over the signal values', () => {
    const s = Signal.fromArray(range(1, 3))

    scan(add)(0)(s).subscribe(valueSpy, errorSpy, completeSpy);

    [0, 1, 3, 6].forEach((n, index) => {
      expect(valueSpy.mock.calls[index][0]).toBe(n)
    }, this)

    expect(completeSpy).toHaveBeenCalled()
  })

  it('emits an error if the parent signal emits an error', () => {
    const mount = jest.fn(emit => emit.error())
    const s = new Signal(mount)

    scan(always())(0)(s).subscribe({ error: errorSpy })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = scan(always())(0)(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
