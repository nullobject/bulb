import { range } from 'fkit'

import mockSignal from '../internal/mockSignal'
import sequential from './sequential'

let s
let next, error, complete
let emit

describe('sequential', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('sequentially emits the values of an array', () => {
    const t = sequential(range(1, 3), s)

    t(emit)

    range(1, 3).forEach(n => {
      s.next()
      expect(next).toHaveBeenNthCalledWith(n, n)
    })
  })

  it('emits an error when the given signal emits an error', () => {
    sequential([], s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    sequential([], s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = sequential([], s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
