import { always } from 'fkit'

import mockSignal from '../internal/mockSignal'
import zipWith from './zipWith'

let s, t, u
let valueSpy, errorSpy, completeSpy

describe('zipWith', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('zips the corresponding signal values using a function', () => {
    const f = (a, b, c) => a + b + c

    zipWith(f, s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(1)
    t.value(2)
    expect(valueSpy).not.toHaveBeenCalled()
    u.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenCalledWith(6)
  })

  it('emits an error when any of the given signals emit an error', () => {
    zipWith(always(), s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when any of the given signals are completed', () => {
    zipWith(always(), s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the returned signal is unsubscribed', () => {
    const a = zipWith(always(), s, t).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
