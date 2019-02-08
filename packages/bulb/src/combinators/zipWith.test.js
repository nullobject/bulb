import { always } from 'fkit'

import mockSignal from '../internal/mockSignal'
import zipWith from './zipWith'

let s, t, u
let nextSpy, errorSpy, completeSpy

describe('zipWith', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('zips the corresponding signal values using a function', () => {
    const f = jest.fn((a, b, c) => a + b + c)

    zipWith(f, [s, t, u]).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    t.next(2)
    expect(nextSpy).not.toHaveBeenCalled()
    u.next(3)
    expect(f).toHaveBeenCalledTimes(1)
    expect(f).toHaveBeenCalledWith(1, 2, 3)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenCalledWith(6)
  })

  it('emits an error when any of the given signals emit an error', () => {
    zipWith(always(), [s, t]).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when any of the given signals are completed', () => {
    zipWith(always(), [s, t]).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the returned signal is unsubscribed', () => {
    const a = zipWith(always(), [s, t]).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
