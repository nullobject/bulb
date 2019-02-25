import merge from './merge'
import mockSignal from '../internal/mockSignal'

let s, t
let next, error, complete
let emit

describe('merge', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('merges the given signals', () => {
    merge([s, t])(emit)

    expect(next).not.toHaveBeenCalled()
    s.next('foo')
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith('foo')
    t.next('bar')
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when any of the given signals emit an error', () => {
    merge([s, t])(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when all of the given signals are completed', () => {
    merge([s, t])(emit)

    s.complete()
    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the unsubscribe function is called', () => {
    const unsubscribe = merge([s, t])(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
