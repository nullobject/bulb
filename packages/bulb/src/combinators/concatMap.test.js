import { id } from 'fkit'

import concatMap from './concatMap'
import mockSignal from '../internal/mockSignal'

let s, t, u
let nextSpy, errorSpy, completeSpy

describe('concatMap', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('applies a function to the signal values', () => {
    concatMap(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(t)
    expect(nextSpy).not.toHaveBeenCalled()
    t.next(1)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith(1)
    s.next(u)
    t.next(2)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith(2)
    t.complete()
    u.next(3)
    expect(nextSpy).toHaveBeenCalledTimes(3)
    expect(nextSpy).toHaveBeenLastCalledWith(3)
    u.next(4)
    expect(nextSpy).toHaveBeenCalledTimes(4)
    expect(nextSpy).toHaveBeenLastCalledWith(4)
  })

  it('throws an error when the given signal emits a non-signal value', () => {
    concatMap(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(() => s.next('foo')).toThrow('Signal value must be a signal')
  })

  it('emits an error when the given signal emits an error', () => {
    concatMap(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    concatMap(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the outer signal when the returned signal is unsubscribed', () => {
    const a = concatMap(id, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the inner signal when the returned signal is unsubscribed', () => {
    const a = concatMap(id, s).subscribe()

    s.next(t)
    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
