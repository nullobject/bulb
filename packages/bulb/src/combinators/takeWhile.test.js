import { always, lt } from 'fkit'

import mockSignal from '../internal/mockSignal'
import takeWhile from './takeWhile'

let s
let next, error, complete
let emit

describe('takeWhile', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('emits values from the target signal while the predicate is true', () => {
    takeWhile(lt(3), s)(emit)

    expect(next).not.toHaveBeenCalled()
    s.next(1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(1)
    s.next(2)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(2)
    s.next(3)
    expect(next).toHaveBeenCalledTimes(2)
  })

  it('emits an error when the given signal emits an error', () => {
    takeWhile(always(), s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the predicate is false', () => {
    takeWhile(lt(3), s)(emit)

    s.next(1)
    s.next(2)
    expect(complete).not.toHaveBeenCalled()
    s.next(3)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the given signal is completed', () => {
    takeWhile(always(), s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = takeWhile(always(), s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
