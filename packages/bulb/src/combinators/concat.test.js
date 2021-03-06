import concat from './concat'
import mockSignal from '../internal/mockSignal'

let s, t
let next, error, complete
let emit

describe('concat', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('emits a value when the current signal emits a value', () => {
    concat([s, t])(emit)

    expect(next).not.toHaveBeenCalled()
    s.next(1)
    s.next(2)
    s.complete()
    t.next(3)
    s.next(4)
    t.complete()
    t.next(5)
    expect(next).toHaveBeenCalledTimes(3)
    expect(next).toHaveBeenNthCalledWith(1, 1)
    expect(next).toHaveBeenNthCalledWith(2, 2)
    expect(next).toHaveBeenNthCalledWith(3, 3)
  })

  it('emits an error when the current signal emit an error', () => {
    concat([s, t])(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    s.complete()
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when all of the given signals are completed', () => {
    concat([s, t])(emit)

    s.complete()
    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the unsubscribe function is called', () => {
    const unsubscribe = concat([s, t])(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    s.complete()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
