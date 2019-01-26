import delay from './delay'
import mockSignal from '../internal/mockSignal'

let s
let valueSpy, errorSpy, completeSpy

describe('delay', () => {
  beforeEach(() => {
    s = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()

    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('delays the signal values', () => {
    delay(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(1)
    s.value(2)
    jest.advanceTimersByTime(500)
    s.value(3)
    expect(valueSpy).not.toHaveBeenCalled()
    jest.advanceTimersByTime(500)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenNthCalledWith(1, 1)
    expect(valueSpy).toHaveBeenNthCalledWith(2, 2)
    jest.advanceTimersByTime(500)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenNthCalledWith(3, 3)
  })

  it('emits an error when the given signal emits an error', () => {
    delay(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    delay(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

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
