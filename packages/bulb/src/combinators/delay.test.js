import delay from './delay'
import mockSignal from '../internal/mockSignal'

let s
let nextSpy, errorSpy, completeSpy

describe('delay', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()

    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('delays the signal values', () => {
    delay(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    s.next(2)
    jest.advanceTimersByTime(500)
    s.next(3)
    expect(nextSpy).not.toHaveBeenCalled()
    jest.advanceTimersByTime(500)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenNthCalledWith(1, 1)
    expect(nextSpy).toHaveBeenNthCalledWith(2, 2)
    jest.advanceTimersByTime(500)
    expect(nextSpy).toHaveBeenCalledTimes(3)
    expect(nextSpy).toHaveBeenNthCalledWith(3, 3)
  })

  it('emits an error when the given signal emits an error', () => {
    delay(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    delay(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = delay(1000, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
