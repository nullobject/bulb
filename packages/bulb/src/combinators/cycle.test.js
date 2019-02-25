import { range } from 'fkit'

import cycle from './cycle'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('cycle', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('cycles through the values of an array', () => {
    const t = cycle(range(1, 3), s)

    t(emit)

    range(0, 6).forEach(n => {
      s.next()
      expect(next).toHaveBeenNthCalledWith(n + 1, (n % 3) + 1)
    })
  })

  it('emits an error when the given signal emits an error', () => {
    cycle([], s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    cycle([], s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = cycle([], s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
