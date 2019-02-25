import hold from './hold'
import mockSignal from '../internal/mockSignal'

let s, t
let next, error, complete
let emit

describe('hold', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('stops emitting values from the target signal while the control signal is truthy', () => {
    hold(s, t)(emit)

    expect(next).not.toHaveBeenCalled()
    s.next(false)
    t.next('foo')
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith('foo')
    s.next(true)
    t.next('bar')
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith('foo')
  })

  it('emits an error when either signal emits an error', () => {
    hold(s, t)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the target signal is completed', () => {
    hold(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the control signal is completed', () => {
    hold(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the unsubscribe function is called', () => {
    const unsubscribe = hold(s, t)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the target signal when the unsubscribe function is called', () => {
    const unsubscribe = hold(s, t)(emit)

    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
