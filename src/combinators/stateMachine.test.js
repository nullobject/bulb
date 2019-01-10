import { always } from 'fkit'

import stateMachine from './stateMachine'
import { mockSignal } from '../emitter'

let s
let valueSpy, errorSpy, completeSpy

describe('stateMachine', () => {
  beforeEach(() => {
    s = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('folds a transform function over the signal values', () => {
    stateMachine((a, b, emit) => {
      emit.value(a * b)
      return a + b
    }, 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    s.value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(0)
    s.value(2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    s.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenLastCalledWith(9)
  })

  it('emits an error when the given signal emits an error', () => {
    stateMachine(always(), 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    stateMachine(always(), 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = stateMachine(always(), 0, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
