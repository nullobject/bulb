import { always, id } from 'fkit'

import switchMap from './switchMap'
import { mockSignal } from '../emitter'

let s, t, u
let valueSpy, errorSpy, completeSpy

describe('switchMap', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('applies a function to the signal values', () => {
    switchMap(id, s).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(t)
    expect(valueSpy).not.toHaveBeenCalled()
    t.value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    s.value(u)
    t.value(2)
    u.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(3)
    u.value(4)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenLastCalledWith(4)
  })

  it('throws an error when the given signal emits a non-signal value', () => {
    switchMap(id, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(() => s.value('foo')).toThrow('Signal value must be a signal')
  })

  it('emits an error when the given signal emits an error', () => {
    switchMap(always(), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    switchMap(id, t).subscribe(valueSpy, errorSpy, completeSpy)

    s.complete()
    expect(completeSpy).not.toHaveBeenCalled()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the outer signal when the returned signal is unsubscribed', () => {
    const a = switchMap(id, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the inner signal when the returned signal is unsubscribed', () => {
    const t = mockSignal()
    const a = switchMap(id, s).subscribe()

    s.value(t)
    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
