import { always, id } from 'fkit'

import mockSignal from '../internal/mockSignal'
import switchMap from './switchMap'

let s, t, u
let next, error, complete
let emit

describe('switchMap', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('applies a function to the signal values', () => {
    switchMap(id, s)({ next, error, complete })
    s.next(t)
    expect(next).not.toHaveBeenCalled()
    t.next(1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(1)
    s.next(u)
    t.next(2)
    u.next(3)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(3)
    u.next(4)
    expect(next).toHaveBeenCalledTimes(3)
    expect(next).toHaveBeenLastCalledWith(4)
  })

  it('throws an error when the given signal emits a non-signal value', () => {
    switchMap(id, s)({ next, error, complete })
    expect(() => s.next('foo')).toThrow('Value must be a signal')
  })

  it('emits an error when the given signal emits an error', () => {
    switchMap(always(), s)({ next, error, complete })
    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    switchMap(id, s)({ next, error, complete })
    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the outer signal when the unsubscribe function is called', () => {
    const unsubscribe = switchMap(id, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the inner signal when the unsubscribe function is called', () => {
    const t = mockSignal(emit)
    const unsubscribe = switchMap(id, s)()

    s.next(t)
    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
