import { add, id } from 'fkit'

import fold from './fold'
import mockSignal from '../internal/mockSignal'

let s
let valueSpy, errorSpy, completeSpy

describe('fold', () => {
  beforeEach(() => {
    s = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('folds a function over the signal values', () => {
    const f = jest.fn(add)

    fold(f, 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(1)
    expect(f).toHaveBeenLastCalledWith(0, 1, 0)
    s.value(2)
    expect(f).toHaveBeenLastCalledWith(1, 2, 1)
    s.value(3)
    expect(f).toHaveBeenLastCalledWith(3, 3, 2)
    expect(valueSpy).not.toHaveBeenCalled()
    s.complete(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenCalledWith(6)
  })

  it('emits an error when the given signal emits an error', () => {
    fold(id, 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    fold(id, 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = fold(id, 0, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
