import Signal from '../Signal'
import merge from './merge'

let valueSpy, errorSpy, completeSpy

describe('merge', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('merges the given signals', () => {
    let valueS, valueT
    const s = new Signal(emit => {
      valueS = emit.value
    })
    const t = new Signal(emit => {
      valueT = emit.value
    })

    merge(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    valueS('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
    valueT('bar')
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when any of the given signals emits an error', () => {
    let errorS, errorT
    const s = new Signal(emit => {
      errorS = emit.error
    })
    const t = new Signal(emit => {
      errorT = emit.error
    })

    merge(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    errorS('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
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

    merge(s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    completeS()
    completeT()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signals when the returned signal is unsubscribed', () => {
    const unmountS = jest.fn()
    const unmountT = jest.fn()
    const s = new Signal(() => unmountS)
    const t = new Signal(() => unmountT)
    const a = merge(s, t).subscribe()

    expect(unmountS).not.toHaveBeenCalled()
    expect(unmountT).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmountS).toHaveBeenCalledTimes(1)
    expect(unmountT).toHaveBeenCalledTimes(1)
  })
})
