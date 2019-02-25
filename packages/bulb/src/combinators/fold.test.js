import { add, id } from 'fkit'

import fold from './fold'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('fold', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('folds a function over the signal values', () => {
    const f = jest.fn(add)

    fold(f, 0, s)(emit)

    s.next(1)
    expect(f).toHaveBeenLastCalledWith(0, 1, 0)
    s.next(2)
    expect(f).toHaveBeenLastCalledWith(1, 2, 1)
    s.next(3)
    expect(f).toHaveBeenLastCalledWith(3, 3, 2)
    expect(next).not.toHaveBeenCalled()
    s.complete(1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(6)
  })

  it('emits an error when the given signal emits an error', () => {
    fold(id, 0, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    fold(id, 0, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = fold(id, 0, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
