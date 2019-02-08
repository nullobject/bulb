import debounce from './debounce'
import mockSignal from '../internal/mockSignal'

let s
let nextSpy, errorSpy, completeSpy

describe('debounce', () => {
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

  it('debounces the signal values', () => {
    debounce(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    s.next(2)
    s.next(3)
    expect(nextSpy).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1000)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenCalledWith(3)
  })

  it('emits an error when the given signal emits an error', () => {
    debounce(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    debounce(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

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
