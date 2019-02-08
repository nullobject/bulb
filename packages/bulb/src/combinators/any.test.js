import { id, lt } from 'fkit'

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

  it('emits true if any of the values emitted by the given signal satisfy a predicate function', () => {
    const f = jest.fn(lt(1))

    any(f, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    expect(f).toHaveBeenLastCalledWith(1)
    s.next(2)
    expect(f).toHaveBeenLastCalledWith(2)
    expect(nextSpy).not.toHaveBeenCalled()
    s.next(0)
    expect(f).toHaveBeenLastCalledWith(0)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenCalledWith(true)
  })

  it('emits false if none of the values emitted by the given signal don\'t satisfy a predicate function', () => {
    const f = jest.fn(lt(1))

    any(f, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    expect(f).toHaveBeenLastCalledWith(1)
    s.next(2)
    expect(f).toHaveBeenLastCalledWith(2)
    s.next(3)
    expect(f).toHaveBeenLastCalledWith(3)
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

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = any(id, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
