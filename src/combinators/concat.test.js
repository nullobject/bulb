import Signal from '../Signal'
import concat from './concat'

let valueSpy, errorSpy, completeSpy

describe('concat', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('emits a value when the current signal emits a value', () => {
    let valueS, valueT
    let completeS
    const s = new Signal(emit => {
      valueS = emit.value
      completeS = emit.complete
    })
    const t = new Signal(emit => {
      valueT = emit.value
    })

    concat(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    valueS(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    valueS(2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    completeS()
    valueT(3)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenLastCalledWith(3)
  })

  it('emits an error when the current signal emit an error', () => {
    let errorS, errorT
    let completeS
    const s = new Signal(emit => {
      errorS = emit.error
      completeS = emit.complete
    })
    const t = new Signal(emit => {
      errorT = emit.error
    })

    concat(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    errorS('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    completeS()
    errorT('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when all of the given signals are completed', () => {
    let completeS, completeT
    const s = new Signal(emit => {
      completeS = emit.complete
    })
    const t = new Signal(emit => {
      completeT = emit.complete
    })

    concat(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    completeS()
    expect(completeSpy).not.toHaveBeenCalled()
    completeT()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the current signal when the returned signal is unsubscribed', () => {
    const unmountS = jest.fn()
    const unmountT = jest.fn()
    const s = new Signal(() => unmountS)
    const t = new Signal(() => unmountT)
    const a = concat(s, t).subscribe()

    expect(unmountS).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmountS).toHaveBeenCalledTimes(1)
    expect(unmountT).not.toHaveBeenCalled()
  })
})
