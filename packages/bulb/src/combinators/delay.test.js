import delay from './delay'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('delay', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }

    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('delays the signal values', () => {
    delay(1000, s)(emit)

    s.next(1)
    s.next(2)
    jest.advanceTimersByTime(500)
    s.next(3)
    expect(next).not.toHaveBeenCalled()
    jest.advanceTimersByTime(500)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenNthCalledWith(1, 1)
    expect(next).toHaveBeenNthCalledWith(2, 2)
    jest.advanceTimersByTime(500)
    expect(next).toHaveBeenCalledTimes(3)
    expect(next).toHaveBeenNthCalledWith(3, 3)
  })

  it('emits an error when the given signal emits an error', () => {
    delay(1000, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    delay(1000, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = delay(1000, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
