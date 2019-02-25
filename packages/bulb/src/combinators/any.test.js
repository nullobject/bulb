import { id } from 'fkit'

import any from './any'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('any', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('emits true when any value emitted by the given signal satisfies the predicate function', () => {
    const f = jest.fn(id)

    any(f, s)(emit)

    s.next(false)
    expect(next).not.toHaveBeenCalled()
    s.next(true)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(true)
  })

  it('emits false when none of the values emitted by the given signal satisfy the predicate function', () => {
    const f = jest.fn(id)

    any(f, s)(emit)

    s.next(false)
    expect(next).not.toHaveBeenCalled()
    s.complete()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(false)
  })

  it('emits an error when the given signal emits an error', () => {
    any(id, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    any(id, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the predicate function is satisfied', () => {
    const f = jest.fn(id)

    any(f, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.next(true)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned function is called', () => {
    const unsubscribe = any(id, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
