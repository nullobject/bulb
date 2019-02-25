import mockSignal from '../internal/mockSignal'
import sample from './sample'

let s, t
let next, error, complete
let emit

describe('sample', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()

    emit = { next, error, complete }
  })

  it('emits values from the target signal whenever the control signal emits a value', () => {
    sample(s, t)(emit)

    t.next('foo')
    expect(next).not.toHaveBeenCalled()
    s.next()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenLastCalledWith('foo')
    t.next('bar')
    expect(next).toHaveBeenCalledTimes(1)
    s.next()
    expect(next).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when either signal emits an error', () => {
    sample(s, t)(emit)

    expect(error).not.toHaveBeenCalled()
    s.error('foo')
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(error).toHaveBeenCalledTimes(2)
    expect(error).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the target signal is completed', () => {
    sample(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('completes when the control signal is completed', () => {
    sample(s, t)(emit)

    expect(complete).not.toHaveBeenCalled()
    s.complete()
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the unsubscribe function is called', () => {
    const unsubscribe = sample(s, t)(emit)

    expect(s.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the target signal when the unsubscribe function is called', () => {
    const unsubscribe = sample(s, t)(emit)

    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
