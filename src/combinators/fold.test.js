import { add, always, range } from 'fkit'

import Signal from '../Signal'
import fold from './fold'

let valueSpy, errorSpy, completeSpy

describe('#fold', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('folds a function over the signal values', () => {
    const s = Signal.fromArray(range(1, 3))

    fold(add)(0)(s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).toBeCalledWith(6)
    expect(completeSpy).toBeCalled()
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
