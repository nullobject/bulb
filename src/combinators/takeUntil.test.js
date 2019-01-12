import mockSignal from '../internal/mockSignal'
import takeUntil from './takeUntil'

let s, t
let valueSpy, errorSpy, completeSpy

describe('takeUntil', () => {
  beforeEach(() => {
    s = mockSignal()
    t = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits values from the target signal until the control signal emits a value', () => {
    takeUntil(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    t.value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    s.value()
    t.value(2)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
  })

  it('emits an error when either signal emits an error', () => {
    takeUntil(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    t.error('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the control signal emits a value', () => {
    takeUntil(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.value()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the target signal is completed', () => {
    takeUntil(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    t.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the control signal is completed', () => {
    takeUntil(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the returned signal is unsubscribed', () => {
    const a = takeUntil(s, t).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the target signal when the returned signal is unsubscribed', () => {
    const a = takeUntil(s, t).subscribe()

    expect(t.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(t.unmount).toHaveBeenCalledTimes(1)
  })
})
