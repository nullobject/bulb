import { always, lt } from 'fkit'

import mockSignal from '../internal/mockSignal'
import takeWhile from './takeWhile'

let s
let valueSpy, errorSpy, completeSpy

describe('takeWhile', () => {
  beforeEach(() => {
    s = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits values while the predicate is true', () => {
    takeWhile(lt(3), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    s.value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    s.value(2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    s.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(2)
  })

  it('emits an error when the given signal emits an error', () => {
    takeWhile(always(), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the predicate is false', () => {
    takeWhile(lt(3), s).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(1)
    s.value(2)
    expect(completeSpy).not.toHaveBeenCalled()
    s.value(3)
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the given signal is completed', () => {
    takeWhile(always(), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = takeWhile(always(), s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
