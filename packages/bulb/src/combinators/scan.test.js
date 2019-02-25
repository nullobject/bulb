import { add, always } from 'fkit'

import mockSignal from '../internal/mockSignal'
import scan from './scan'
import { asap } from '../scheduler'

jest.mock('../scheduler')

let s
let next, error, complete
let emit

describe('scan', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }

    asap.mockImplementation(f => f())
  })

  afterEach(() => {
    asap.mockRestore()
  })

  it('scans a function over the signal values', () => {
    const f = jest.fn(add)

    scan(f, 0, s)(emit)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(0)
    s.next(1)
    expect(f).toHaveBeenLastCalledWith(0, 1, 0)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(1)
    s.next(2)
    expect(f).toHaveBeenLastCalledWith(1, 2, 1)
    expect(next).toHaveBeenCalledTimes(3)
    expect(next).toHaveBeenLastCalledWith(3)
    s.next(3)
    expect(f).toHaveBeenLastCalledWith(3, 3, 2)
    expect(next).toHaveBeenCalledTimes(4)
    expect(next).toHaveBeenLastCalledWith(6)
  })

  it('emits an error when the given signal emits an error', () => {
    scan(always(), 0, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    scan(always(), 0, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = scan(always(), 0, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
