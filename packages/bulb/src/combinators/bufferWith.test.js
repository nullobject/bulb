import bufferWith from './bufferWith'
import mockSignal from '../internal/mockSignal'

let s, t
let next, error, complete
let emit

describe('bufferWith', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('buffers values emitted by the target signal', () => {
    bufferWith(s, t)(emit)

    t.next(1)
    expect(next).not.toHaveBeenCalled()
    t.next(2)
    s.next()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith([1, 2])
    t.next(3)
    expect(next).toHaveBeenCalledTimes(1)
    t.next(4)
    s.next()
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith([3, 4])
  })

  it('emits an error when the given signal emits an error', () => {
    bufferWith(s, t)(emit)

    expect(error).not.toHaveBeenCalled()
    t.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith('foo')
  })

  it('emits the buffer contents when the given signal is completed', () => {
    bufferWith(s, t)(emit)

    t.next(1)
    t.next(2)
    t.next(3)
    expect(next).not.toHaveBeenCalled()
    t.complete()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith([1, 2, 3])
  })

  it('completes when the given signal is completed', () => {
    bufferWith(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the unsubscribe function is called', () => {
    const unsubscribe = bufferWith(s, t)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
