import { id, gt } from 'fkit'

import filter from './filter'
import mockSignal from '../internal/mockSignal'

let s
let nextSpy, errorSpy, completeSpy

describe('filter', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits values from the given signal that satisfy a predicate function', () => {
    const f = jest.fn(gt(1))

    filter(f, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    expect(f).toHaveBeenLastCalledWith(1, 0)
    expect(nextSpy).not.toHaveBeenCalled()
    s.next(2)
    expect(f).toHaveBeenLastCalledWith(2, 1)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith(2)
    s.next(3)
    expect(f).toHaveBeenLastCalledWith(3, 2)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the given signal emits an error', () => {
    filter(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    filter(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = filter(id, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
