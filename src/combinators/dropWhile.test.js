import { always, lt } from 'fkit'

import Signal from '../Signal'
import dropWhile from './dropWhile'

let valueSpy, errorSpy, completeSpy

describe('dropWhile', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits values after the predicate is false', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    dropWhile(lt(2), s).subscribe(valueSpy, errorSpy, completeSpy)

    value(1)
    expect(valueSpy).not.toHaveBeenCalled()
    value(2)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    value(3)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the given signal emits an error', () => {
    let error
    const s = new Signal(emit => {
      error = emit.error
    })

    dropWhile(always(), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    let complete
    const s = new Signal(emit => {
      complete = emit.complete
    })

    dropWhile(always(), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = dropWhile(always(), s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
