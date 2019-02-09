import concat from './concat'
import mockSignal from '../internal/mockSignal'

let s, t
let nextSpy, errorSpy, completeSpy

describe('concat', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits a value when the current signal emits a value', () => {
    concat([s, t]).subscribe(nextSpy, errorSpy, completeSpy)

    expect(nextSpy).not.toHaveBeenCalled()
    s.next(1)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith(1)
    s.next(2)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith(2)
    s.complete()
    t.next(3)
    expect(nextSpy).toHaveBeenCalledTimes(3)
    expect(nextSpy).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the current signal emit an error', () => {
    concat([s, t]).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    s.complete()
    t.error('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when all of the given signals are completed', () => {
    concat([s, t]).subscribe(nextSpy, errorSpy, completeSpy)

    s.complete()
    expect(completeSpy).not.toHaveBeenCalled()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the returned signal is unsubscribed', () => {
    const a = concat([s, t]).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    s.complete()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
