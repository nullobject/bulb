import { always, range } from 'fkit'

import Signal from '../Signal'
import concatMap from './concatMap'

let valueSpy, errorSpy, completeSpy

describe('#concatMap', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('maps a function over the signal values', () => {
    const s = Signal.fromArray(range(1, 3))
    const f = a => Signal.of(a)

    concatMap(f)(s).subscribe(valueSpy, errorSpy, completeSpy)

    range(1, 3).forEach((n, index) => {
      expect(valueSpy.mock.calls[index][0]).toBe(n)
    }, this)

    expect(completeSpy).toHaveBeenCalled()
  })

  it('emits an error if the parent signal emits an error', () => {
    const mount = jest.fn(emit => emit.error())
    const s = new Signal(mount)

    concatMap(always())(s).subscribe({ error: errorSpy })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const f = a => Signal.of(a)
    const a = concatMap(f)(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the returned signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = Signal.of(0)
    const f = a => new Signal(() => unmount)
    const a = concatMap(f)(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
