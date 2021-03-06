import mockSignal from '../internal/mockSignal'
import take from './take'

let s
let next, error, complete
let emit

describe('take', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('takes the given number of values', () => {
    take(2, s)(emit)

    expect(next).not.toHaveBeenCalled()
    s.next(1)
    s.next(2)
    s.next(3)
    s.next(4)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenNthCalledWith(1, 1)
    expect(next).toHaveBeenNthCalledWith(2, 2)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('emits an error when the given signal emits an error', () => {
    take(1, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('completes after the given number of values', () => {
    take(2, s)(emit)

    s.next()
    expect(complete).not.toHaveBeenCalled()
    s.next()
    s.next()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the given signal is completed', () => {
    take(1, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = take(1, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
