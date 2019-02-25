import { always } from 'fkit'

import mockSignal from '../internal/mockSignal'
import zipWith from './zipWith'

let s, t, u
let next, error, complete
let emit

describe('zipWith', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('zips the corresponding signal values using a function', () => {
    const f = jest.fn((a, b, c) => a + b + c)

    zipWith(f, [s, t, u])(emit)

    s.next(1)
    t.next(2)
    expect(next).not.toHaveBeenCalled()
    u.next(3)
    expect(f).toHaveBeenCalledTimes(1)
    expect(f).toHaveBeenCalledWith(1, 2, 3)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(6)
  })

  it('emits an error when any of the given signals emit an error', () => {
    zipWith(always(), [s, t])(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when any of the given signals are completed', () => {
    zipWith(always(), [s, t])(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)

    complete.mockClear()

    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the unsubscribe function is called', () => {
    const unsubscribe = zipWith(always(), [s, t])(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
