import debounce from './debounce'
import { mockSignal } from '../emitter'

let s
let valueSpy, errorSpy, completeSpy

describe('debounce', () => {
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

  it('debounces the signal values', () => {
    debounce(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(1)
    s.value(2)
    s.value(3)
    expect(valueSpy).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1000)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenCalledWith(3)
  })

  it('emits an error when the given signal emits an error', () => {
    debounce(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    debounce(1000, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = debounce(1000, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
