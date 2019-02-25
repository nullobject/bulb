import { always } from 'fkit'

import mockSignal from '../internal/mockSignal'
import stateMachine from './stateMachine'

let s
let next, error, complete
let emit

describe('stateMachine', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('folds a transform function over the signal values', () => {
    stateMachine((a, b, emit) => {
      emit.next(a * b)
      return a + b
    }, 0, s)(emit)

    expect(next).not.toHaveBeenCalled()
    s.next(1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(0)
    s.next(2)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(2)
    s.next(3)
    expect(next).toHaveBeenCalledTimes(3)
    expect(next).toHaveBeenLastCalledWith(9)
  })

  it('emits an error when the given signal emits an error', () => {
    stateMachine(always(), 0, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    stateMachine(always(), 0, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = stateMachine(always(), 0, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
