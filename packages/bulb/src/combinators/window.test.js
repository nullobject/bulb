import window from './window'
import mockSignal from '../internal/mockSignal'

let s, t
let next, error, complete
let innerNext, innerError, innerComplete
let emit
let innerEmit

describe('window', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    next = jest.fn()
    error = jest.fn()
    complete = jest.fn()
    innerNext = jest.fn()
    innerError = jest.fn()
    innerComplete = jest.fn()

    emit = { next, error, complete }
    innerEmit = { next: innerNext, error: innerError, complete: innerComplete }
  })

  it('emits a signal that forwards values from the target signal', () => {
    window(s, t)(emit)

    const u = next.mock.calls[0][0]
    u(innerEmit)

    expect(innerNext).not.toHaveBeenCalled()
    t.next(1)
    expect(innerNext).toHaveBeenLastCalledWith(1)
    s.next()
  })

  it('emits a signal that forwards errors from the target signal', () => {
    window(s, t)(emit)

    const u = next.mock.calls[0][0]
    u(innerEmit)

    expect(error).not.toHaveBeenCalled()
    expect(innerError).not.toHaveBeenCalled()
    t.error('foo')
    expect(innerError).toHaveBeenCalledTimes(1)
    expect(innerError).toHaveBeenCalledWith('foo')
  })

  it('completes the emitted signal when starting a new window', () => {
    window(s, t)(emit)

    const u = next.mock.calls[0][0]
    u(innerEmit)

    expect(complete).not.toHaveBeenCalled()
    expect(innerComplete).not.toHaveBeenCalled()
    s.next()
    expect(innerComplete).toHaveBeenCalledTimes(1)
  })

  it('completes when the target signal is completed', () => {
    window(s, t)(emit)

    const u = next.mock.calls[0][0]
    u(innerEmit)

    expect(complete).not.toHaveBeenCalled()
    expect(innerComplete).not.toHaveBeenCalled()
    t.complete()
    expect(complete).toHaveBeenCalledTimes(1)
    expect(innerComplete).toHaveBeenCalledTimes(1)
  })

  it('unmounts all signals when the unsubscribe function is called', () => {
    const unsubscribe = window(s, t)(emit)

    const u = next.mock.calls[0][0]
    u(innerEmit)

    expect(s.unmount).not.toHaveBeenCalled()
    expect(t.unmount).not.toHaveBeenCalled()
    unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
