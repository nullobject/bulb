import Signal from '../Signal'
import hold from './hold'

let valueSpy, errorSpy, completeSpy

describe('hold', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('stops emitting values from the target signal when while is a truthy value on the control signal', () => {
    let valueS, valueT
    const s = new Signal(emit => {
      valueS = emit.value
    })
    const t = new Signal(emit => {
      valueT = emit.value
    })

    hold(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    valueS(false)
    valueT('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
    valueS(true)
    valueT('bar')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
  })

  it('emits an error when either signal emits an error', () => {
    let errorS, errorT
    const s = new Signal(emit => {
      errorS = emit.error
    })
    const t = new Signal(emit => {
      errorT = emit.error
    })

    hold(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    errorS('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    errorT('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when the control signal is completed', () => {
    let complete
    const s = new Signal(emit => {
      complete = emit.complete
    })
    const t = Signal.never()

    hold(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = Signal.never()
    const a = hold(s, t).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the held signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = Signal.never()
    const t = new Signal(() => unmount)
    const a = hold(s, t).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
