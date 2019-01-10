import concat from './concat'
import { mockSignal } from '../emitter'

let s, t
let valueSpy, errorSpy, completeSpy

describe('concat', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits a value when the current signal emits a value', () => {
    concat(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    s.value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    s.value(2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    s.complete()
    t.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the current signal emit an error', () => {
    concat(s, t).subscribe(valueSpy, errorSpy, completeSpy)

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
    concat(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    s.complete()
    expect(completeSpy).not.toHaveBeenCalled()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the returned signal is unsubscribed', () => {
    const a = concat(s, t).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    s.complete()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
