import { id, gt } from 'fkit'

import filter from './filter'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('filter', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('emits values from the given signal that satisfy the predicate function', () => {
    const f = jest.fn(gt(1))

    filter(f, s)(emit)

    s.next(1)
    expect(f).toHaveBeenLastCalledWith(1, 0)
    expect(next).not.toHaveBeenCalled()
    s.next(2)
    expect(f).toHaveBeenLastCalledWith(2, 1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(2)
    s.next(3)
    expect(f).toHaveBeenLastCalledWith(3, 2)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the given signal emits an error', () => {
    filter(id, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    filter(id, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = filter(id, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
