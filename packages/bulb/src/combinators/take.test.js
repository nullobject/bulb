import mockSignal from '../internal/mockSignal'
import take from './take'

let s
let nextSpy, errorSpy, completeSpy

describe('take', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('takes the given number of values', () => {
    take(2, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(nextSpy).not.toHaveBeenCalled()
    s.next(1)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith(1)
    s.next(2)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith(2)
    s.next(3)
    expect(nextSpy).toHaveBeenCalledTimes(2)
  })

  it('emits an error when the given signal emits an error', () => {
    take(1, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes after the given number of values', () => {
    take(2, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next()
    expect(completeSpy).not.toHaveBeenCalled()
    s.next()
    s.next()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the given signal is completed', () => {
    take(1, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = take(1, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
