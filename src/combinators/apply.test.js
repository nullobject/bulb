import { dec, inc } from 'fkit'

import apply from './apply'
import mockSignal from '../internal/mockSignal'

let s, t
let valueSpy, errorSpy, completeSpy

describe('apply', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('applies the latest function to the latest value', () => {
    apply(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(inc)
    expect(valueSpy).not.toHaveBeenCalled()
    t.value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    s.value(dec)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(0)
    t.value(2)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    t.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(4)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
  })

  it('emits an error when either signal emits an error', () => {
    apply(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the function signal is completed', () => {
    apply(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the value signal is completed', () => {
    apply(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the returned signal is unsubscribed', () => {
    const a = apply(s, t).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the target signal when the returned signal is unsubscribed', () => {
    const a = apply(s, t).subscribe()

    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
