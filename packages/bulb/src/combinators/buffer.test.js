import buffer from './buffer'
import mockSignal from '../internal/mockSignal'

let s
let next, error, complete
let emit

describe('buffer', () => {
  beforeEach(() => {
    s = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('buffers values emitted by the target signal', () => {
    buffer(2, s)(emit)

    s.next(1)
    expect(next).not.toHaveBeenCalled()
    s.next(2)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith([1, 2])
    s.next(3)
    expect(next).toHaveBeenCalledTimes(1)
    s.next(4)
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith([3, 4])
  })

  it('emits an error when the given signal emits an error', () => {
    buffer(0, s)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('emits the buffer contents when the given signal is completed', () => {
    buffer(Infinity, s)(emit)

    s.next(1)
    s.next(2)
    s.next(3)
    expect(next).not.toHaveBeenCalled()
    s.complete()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith([1, 2, 3])
  })

  it('completes when the given signal is completed', () => {
    buffer(0, s)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = buffer(0, s)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
