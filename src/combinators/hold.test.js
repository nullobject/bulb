import hold from './hold'
import { mockSignal } from '../emitter'

let s, t
let valueSpy, errorSpy, completeSpy

describe('hold', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('stops emitting values from the target signal when while is a truthy value on the control signal', () => {
    hold(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    s.value(false)
    t.value('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
    s.value(true)
    t.value('bar')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
  })

  it('emits an error when either signal emits an error', () => {
    hold(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the control signal is completed', () => {
    hold(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the returned signal is unsubscribed', () => {
    const a = hold(s, t).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the target signal when the returned signal is unsubscribed', () => {
    const a = hold(s, t).subscribe()

    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
