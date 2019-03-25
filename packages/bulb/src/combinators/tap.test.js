import { id } from 'fkit'

import tap from './tap'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('tap', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('performs a side effect', () => {
    const f = jest.fn()

    tap(f, s)(emit)

    expect(next).not.toHaveBeenCalled()
    s.next(1)
    expect(f).toHaveBeenLastCalledWith(1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(1)
  })

  it('emits an error when the given signal emits an error', () => {
    tap(id, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    tap(id, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = tap(id, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
