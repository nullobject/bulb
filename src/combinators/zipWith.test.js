import { always } from 'fkit'

import Signal from '../Signal'
import zipWith from './zipWith'

let valueSpy, errorSpy, completeSpy

describe('zipWith', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('zips the corresponding signal values using a function', () => {
    let valueS, valueT, valueU
    const s = new Signal(emit => {
      valueS = emit.value
    })
    const t = new Signal(emit => {
      valueT = emit.value
    })
    const u = new Signal(emit => {
      valueU = emit.value
    })
    const f = (a, b, c) => a + b + c

    zipWith(f, s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    valueS(1)
    valueT(2)
    expect(valueSpy).not.toHaveBeenCalled()
    valueU(3)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenCalledWith(6)
  })

  it('emits an error when any of the given signals emit an error', () => {
    let errorS, errorT
    const s = new Signal(emit => {
      errorS = emit.error
    })
    const t = new Signal(emit => {
      errorT = emit.error
    })

    zipWith(always(), s, t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    errorS('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    errorT('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('completes when any of the given signals are completed', () => {
    let completeS, completeT
    const s = new Signal(emit => {
      completeS = emit.complete
    })
    const t = new Signal(emit => {
      completeT = emit.complete
    })

    zipWith(always(), s, t).subscribe(valueSpy, errorSpy, completeSpy)

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
    const a = zipWith(always(), s, t).subscribe()

    expect(unmountS).not.toHaveBeenCalled()
    expect(unmountT).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmountS).toHaveBeenCalledTimes(1)
    expect(unmountT).toHaveBeenCalledTimes(1)
  })
})
