import mockSignal from '../internal/mockSignal'
import dropUntil from './dropUntil'

let s, t
let next, error, complete
let emit

describe('dropUntil', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('drops values from the target signal until the control signal emits a value', () => {
    dropUntil(s, t)(emit)

    t.next(1)
    expect(next).not.toHaveBeenCalled()
    s.next()
    t.next(2)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith(2)
  })

  it('emits an error when either signal emits an error', () => {
    dropUntil(s, t)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the target signal is completed', () => {
    dropUntil(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the control signal is completed', () => {
    dropUntil(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the unsubscribe function is called', () => {
    const unsubscribe = dropUntil(s, t)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the target signal when the unsubscribe function is called', () => {
    const unsubscribe = dropUntil(s, t)(emit)

    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
