import apply from './apply'
import mockSignal from '../internal/mockSignal'

let s, t, u
let next, error, complete
let emit

describe('apply', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('applies the latest function to the latest value', () => {
    const f = jest.fn((a, b) => b + a)
    const g = jest.fn((a, b) => b - a)

    apply(s, [t, u])(emit)

    s.next(f)
    t.next(1)
    expect(f).not.toHaveBeenCalled()
    expect(next).not.toHaveBeenCalled()
    u.next(2)
    expect(f).toHaveBeenLastCalledWith(1, 2)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(3)
    s.next(g)
    expect(g).toHaveBeenLastCalledWith(1, 2)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith(1)
    t.next(3)
    expect(g).toHaveBeenLastCalledWith(3, 2)
    expect(next).toHaveBeenCalledTimes(3)
    expect(next).toHaveBeenLastCalledWith(-1)
    u.next(4)
    expect(g).toHaveBeenLastCalledWith(3, 4)
    expect(next).toHaveBeenCalledTimes(4)
    expect(next).toHaveBeenLastCalledWith(1)
  })

  it('emits an error when either signal emits an error', () => {
    apply(s, [t])(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the function signal is completed', () => {
    apply(s, [t])(emit)

    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the value signal is completed', () => {
    apply(s, [t])(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the unsubscribe function is called', () => {
    const unsubscribe = apply(s, [t])(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the target signal when the unsubscribe function is called', () => {
    const unsubscribe = apply(s, [t])(emit)

    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
