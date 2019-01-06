import { always, eq, range } from 'fkit'

import Signal from '../Signal'
import filter from './filter'

let valueSpy, errorSpy, completeSpy

describe('#filter', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('filters the signal values with a predicate', () => {
    const s = Signal.fromArray(range(1, 3))

    filter(eq(2))(s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).toBeCalledWith(2)
    expect(completeSpy).toBeCalled()
  })

  it('emits an error if the parent signal emits an error', () => {
    const mount = jest.fn(emit => emit.error())
    const s = new Signal(mount)

    filter(always())(s).subscribe({ error: errorSpy })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = filter(always())(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
