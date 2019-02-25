import mockSignal from '../internal/mockSignal'
import throttle from './throttle'

let s
let next, error, complete
let emit

describe('throttle', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('throttle the signal values', () => {
    throttle(1000, s)(emit)

    expect(next).not.toHaveBeenCalled()
    Date.now = jest.fn(() => 0)
    s.next('foo')
    s.next('bar')
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith('foo')
    Date.now = jest.fn(() => 1000)
    s.next('bar')
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when the given signal emits an error', () => {
    throttle(1000, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    throttle(1000, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = throttle(1000, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
