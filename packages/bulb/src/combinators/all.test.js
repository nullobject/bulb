import { id } from 'fkit'

import all from './all'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('all', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('emits true when all the values emitted by the given signal satisfy the predicate function', () => {
    const f = jest.fn(id)

    all(f, s)(emit)

    s.next(true)
    expect(next).not.toHaveBeenCalled()
    s.complete()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(true)
  })

  it('emits false when any value emitted by the given signal doesn\'t satisfy the predicate function', () => {
    const f = jest.fn(id)

    all(f, s)(emit)

    expect(next).not.toHaveBeenCalled()
    s.next(false)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(false)
  })

  it('emits an error when the given signal emits an error', () => {
    all(id, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    all(id, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the predicate function is unsatisfied', () => {
    const f = jest.fn(id)

    all(f, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.next(false)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = all(id, s)()

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
