import { always, lt } from 'fkit'

import Signal from '../Signal'
import takeWhile from './takeWhile'

let valueSpy, errorSpy, completeSpy

describe('takeWhile', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits values while the predicate is true', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    takeWhile(lt(3), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    value(2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    value(3)
    expect(valueSpy).toHaveBeenCalledTimes(2)
  })

  it('emits an error when the given signal emits an error', () => {
    let error
    const s = new Signal(emit => {
      error = emit.error
    })

    takeWhile(always(), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the predicate is false', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    takeWhile(lt(3), s).subscribe(valueSpy, errorSpy, completeSpy)

    value(1)
    value(2)
    expect(completeSpy).not.toHaveBeenCalled()
    value(3)
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the given signal is completed', () => {
    let complete
    const s = new Signal(emit => {
      complete = emit.complete
    })

    takeWhile(always(), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = takeWhile(always(), s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
