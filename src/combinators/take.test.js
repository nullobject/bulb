import take from './take'
import { mockSignal } from '../emitter'

let s
let valueSpy, errorSpy, completeSpy

describe('take', () => {
  beforeEach(() => {
    s = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('takes the given number of values', () => {
    take(2, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    s.value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    s.value(2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    s.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(2)
  })

  it('emits an error when the given signal emits an error', () => {
    take(1, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes after the given number of values', () => {
    take(2, s).subscribe(valueSpy, errorSpy, completeSpy)

    s.value()
    expect(completeSpy).not.toHaveBeenCalled()
    s.value()
    s.value()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the given signal is completed', () => {
    take(1, s).subscribe(valueSpy, errorSpy, completeSpy)

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
