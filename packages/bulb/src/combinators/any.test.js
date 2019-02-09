import { id } from 'fkit'

import any from './any'
import mockSignal from '../internal/mockSignal'

let s
let nextSpy, errorSpy, completeSpy

describe('any', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits true when any value emitted by the given signal satisfies the predicate function', () => {
    const f = jest.fn(id)

    any(f, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(false)
    expect(nextSpy).not.toHaveBeenCalled()
    s.next(true)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenCalledWith(true)
  })

  it('emits false when none of the values emitted by the given signal satisfy the predicate function', () => {
    const f = jest.fn(id)

    any(f, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(false)
    expect(nextSpy).not.toHaveBeenCalled()
    s.complete()
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenCalledWith(false)
  })

  it('emits an error when the given signal emits an error', () => {
    any(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    any(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the predicate function is satisfied', () => {
    const f = jest.fn(id)

    any(f, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.next(true)
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = any(id, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
