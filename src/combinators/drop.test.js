import Signal from '../Signal'
import drop from './drop'

let valueSpy, errorSpy, completeSpy

describe('drop', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('drops the given number of values', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    drop(1, s).subscribe(valueSpy, errorSpy, completeSpy)

    value(1)
    expect(valueSpy).not.toHaveBeenCalled()
    value(2)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    value(3)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the given signal emits an error', () => {
    let error
    const s = new Signal(emit => {
      error = emit.error
    })

    drop(1, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    let complete
    const s = new Signal(emit => {
      complete = emit.complete
    })

    drop(1, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = drop(1, s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
