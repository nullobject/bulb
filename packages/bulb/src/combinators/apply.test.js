import apply from './apply'
import mockSignal from '../internal/mockSignal'

let s, t, u
let nextSpy, errorSpy, completeSpy

describe('apply', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()
    u = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('applies the latest function to the latest value', () => {
    const f = jest.fn((a, b) => b + a)
    const g = jest.fn((a, b) => b - a)

    apply(s, t, u).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(f)
    t.next(1)
    expect(f).not.toHaveBeenCalled()
    expect(nextSpy).not.toHaveBeenCalled()
    u.next(2)
    expect(f).toHaveBeenLastCalledWith(1, 2)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith(3)
    s.next(g)
    expect(g).toHaveBeenLastCalledWith(1, 2)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith(1)
    t.next(3)
    expect(g).toHaveBeenLastCalledWith(3, 2)
    expect(nextSpy).toHaveBeenCalledTimes(3)
    expect(nextSpy).toHaveBeenLastCalledWith(-1)
    u.next(4)
    expect(g).toHaveBeenLastCalledWith(3, 4)
    expect(nextSpy).toHaveBeenCalledTimes(4)
    expect(nextSpy).toHaveBeenLastCalledWith(1)
  })

  it('emits an error when either signal emits an error', () => {
    apply(s, t).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the function signal is completed', () => {
    apply(s, t).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the value signal is completed', () => {
    apply(s, t).subscribe(nextSpy, errorSpy, completeSpy)

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
