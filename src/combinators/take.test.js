import Signal from '../Signal'
import take from './take'

let valueSpy, errorSpy, completeSpy

describe('take', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('takes the given number of values', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    take(2, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    value(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    value(2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    value(3)
    expect(valueSpy).toHaveBeenCalledTimes(2)
  })

  it('emits an error when the given signal emits an error', () => {
    let error
    const s = new Signal(emit => {
      error = emit.error
    })

    take(1, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes after the given number of values', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    take(2, s).subscribe(valueSpy, errorSpy, completeSpy)

    value()
    expect(completeSpy).not.toHaveBeenCalled()
    value()
    value()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('completes when the given signal is completed', () => {
    let complete
    const s = new Signal(emit => {
      complete = emit.complete
    })

    take(1, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = take(1, s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
