import { id, lt } from 'fkit'

import dropWhile from './dropWhile'
import mockSignal from '../internal/mockSignal'

let s
let nextSpy, errorSpy, completeSpy

describe('dropWhile', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('drops values from the target signal until the predicate is false', () => {
    dropWhile(lt(2), s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    expect(nextSpy).not.toHaveBeenCalled()
    s.next(2)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith(2)
    s.next(3)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the given signal emits an error', () => {
    dropWhile(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    dropWhile(id, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = dropWhile(id, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
