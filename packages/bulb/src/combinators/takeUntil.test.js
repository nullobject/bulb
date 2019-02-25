import mockSignal from '../internal/mockSignal'
import takeUntil from './takeUntil'

let s, t
let next, error, complete
let emit

describe('takeUntil', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('emits values from the target signal until the control signal emits a value', () => {
    takeUntil(s, t)(emit)

    expect(next).not.toHaveBeenCalled()
    t.next(1)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(1)
    s.next()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('emits an error when either signal emits an error', () => {
    takeUntil(s, t)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the target signal is completed', () => {
    takeUntil(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the control signal is completed', () => {
    takeUntil(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the unsubscribe function is called', () => {
    const unsubscribe = takeUntil(s, t)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the target signal when the unsubscribe function is called', () => {
    const unsubscribe = takeUntil(s, t)(emit)

    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
