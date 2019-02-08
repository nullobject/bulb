import { always, id } from 'fkit'

import catchError from './catchError'
import mockSignal from '../internal/mockSignal'

let s, t, u
let nextSpy, errorSpy, completeSpy

describe('catchError', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('applies a function to the signal errors', () => {
    catchError(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.error(t)
    expect(errorSpy).not.toHaveBeenCalled()
    t.next(1)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith(1)
    t.next(2)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith(2)
    s.error(u)
    expect(errorSpy).not.toHaveBeenCalled()
    t.next(3)
    expect(nextSpy).toHaveBeenCalledTimes(3)
    expect(nextSpy).toHaveBeenLastCalledWith(3)
  })

  it('throws an error when the given signal emits a non-signal error', () => {
    catchError(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(() => s.error('foo')).toThrow('Signal value must be a signal')
  })

  it('completes when the given signal is completed', () => {
    catchError(always(), s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when it emits an error', () => {
    catchError(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(s.unmount).not.toHaveBeenCalled()
    s.error(t)
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the outer signal when the returned signal is unsubscribed', () => {
    const a = catchError(id, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the inner signal when the returned signal is unsubscribed', () => {
    const t = mockSignal()
    const a = catchError(id, s).subscribe()

    s.error(t)
    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
