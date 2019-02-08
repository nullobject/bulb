import mockSignal from '../internal/mockSignal'
import throttle from './throttle'

let s
let nextSpy, errorSpy, completeSpy

describe('throttle', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('throttle the signal values', () => {
    throttle(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(nextSpy).not.toHaveBeenCalled()
    Date.now = jest.fn(() => 0)
    s.next('foo')
    s.next('bar')
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith('foo')
    Date.now = jest.fn(() => 1000)
    s.next('bar')
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when the given signal emits an error', () => {
    throttle(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    throttle(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = throttle(1000, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
