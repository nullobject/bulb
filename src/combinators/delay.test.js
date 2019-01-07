import Signal from '../Signal'
import delay from './delay'

let valueSpy, errorSpy, completeSpy

describe('delay', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('delays the signal values', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    delay(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

    value(1)
    value(2)
    jest.advanceTimersByTime(500)
    value(3)
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
    let error
    const s = new Signal(emit => {
      error = emit.error
    })

    delay(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    let complete
    const s = new Signal(emit => {
      complete = emit.complete
    })

    delay(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = delay(1000, s).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
