import apply from './apply'
import mockSignal from '../internal/mockSignal'

let s, t, u
let valueSpy, errorSpy, completeSpy

describe('apply', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('applies the latest function to the latest value', () => {
    const f = jest.fn((a, b) => b + a)
    const g = jest.fn((a, b) => b - a)

    apply(s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(f)
    t.value(1)
    expect(f).not.toHaveBeenCalled()
    expect(valueSpy).not.toHaveBeenCalled()
    u.value(2)
    expect(f).toHaveBeenLastCalledWith(1, 2)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(3)
    s.value(g)
    expect(g).toHaveBeenLastCalledWith(1, 2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    t.value(3)
    expect(g).toHaveBeenLastCalledWith(3, 2)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenLastCalledWith(-1)
    u.value(4)
    expect(g).toHaveBeenLastCalledWith(3, 4)
    expect(valueSpy).toHaveBeenCalledTimes(4)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
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
