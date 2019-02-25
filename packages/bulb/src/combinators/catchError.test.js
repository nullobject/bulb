import { always, id } from 'fkit'

import catchError from './catchError'
import mockSignal from '../internal/mockSignal'

let s, t, u
let next, error, complete
let emit

describe('catchError', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('applies a function to the signal errors', () => {
    catchError(id, s)(emit)

    s.error(t)
    expect(error).not.toHaveBeenCalled()
    t.next(1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(1)
    t.next(2)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(2)
    s.error(u)
    expect(error).not.toHaveBeenCalled()
    t.next(3)
    expect(next).toHaveBeenCalledTimes(3)
    expect(next).toHaveBeenLastCalledWith(3)
  })

  it('throws an error when the given signal emits a non-signal error', () => {
    catchError(id, s)(emit)

    expect(() => s.error('foo')).toThrow('Value must be a signal')
  })

  it('completes when the given signal is completed', () => {
    catchError(always(), s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when it emits an error', () => {
    catchError(id, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    s.error(t)
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the outer signal when the unsubscribe function is called', () => {
    const unsubscribe = catchError(id, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the inner signal when the unsubscribe function is called', () => {
    const t = mockSignal()
    const unsubscribe = catchError(id, s)(emit)

    s.error(t)
    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
