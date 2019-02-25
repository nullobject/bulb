import { eq } from 'fkit'

import dedupeWith from './dedupeWith'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('dedupeWith', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('removes duplicate signal values with a comparator function', () => {
    dedupeWith(eq, s)(emit)

    expect(next).not.toHaveBeenCalled()
    s.next('foo')
    s.next('foo')
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith('foo')
    s.next('bar')
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when the given signal emits an error', () => {
    dedupeWith(eq, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    dedupeWith(eq, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = dedupeWith(eq, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
