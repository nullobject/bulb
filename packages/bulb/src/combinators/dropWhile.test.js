import { id, lt } from 'fkit'

import dropWhile from './dropWhile'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('dropWhile', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('drops values from the target signal until the predicate is false', () => {
    dropWhile(lt(2), s)(emit)

    s.next(1)
    expect(next).not.toHaveBeenCalled()
    s.next(2)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(2)
    s.next(3)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the given signal emits an error', () => {
    dropWhile(id, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    dropWhile(id, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = dropWhile(id, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
