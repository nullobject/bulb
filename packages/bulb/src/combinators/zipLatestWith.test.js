import { always } from 'fkit'

import mockSignal from '../internal/mockSignal'
import zipLatestWith from './zipLatestWith'

let s, t, u
let next, error, complete
let emit

describe('zipLatestWith', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('zips the latest signal values using a function', () => {
    const f = jest.fn((a, b, c) => a + b + c)

    zipLatestWith(f, [s, t, u])(emit)

    s.next(1)
    expect(next).not.toHaveBeenCalled()
    t.next(2)
    expect(next).not.toHaveBeenCalled()
    u.next(3)
    expect(f).toHaveBeenLastCalledWith(1, 2, 3)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(6)
    u.next(4)
    expect(f).toHaveBeenLastCalledWith(1, 2, 4)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(7)
  })

  it('emits an error when any of the given signals emit an error', () => {
    zipLatestWith(always(), [s, t])(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when all of the given signals are completed', () => {
    zipLatestWith(always(), [s, t])(emit)

    s.complete()
    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the unsubscribe function is called', () => {
    const unsubscribe = zipLatestWith(always(), [s, t])(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
