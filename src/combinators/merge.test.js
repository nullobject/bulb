import merge from './merge'
import { mockSignal } from '../emitter'

let s, t
let valueSpy, errorSpy, completeSpy

describe('merge', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('merges the given signals', () => {
    merge(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    s.value('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
    t.value('bar')
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when any of the given signals emit an error', () => {
    merge(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when all of the given signals are completed', () => {
    merge(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    s.complete()
    expect(completeSpy).not.toHaveBeenCalled()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the returned signal is unsubscribed', () => {
    const a = merge(s, t).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
