import { always, id } from 'fkit'

import Signal from '../Signal'
import concatMap from './concatMap'

let valueSpy, errorSpy, completeSpy

describe('concatMap', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('applies a function to the signal values', () => {
    let valueS, valueT, valueU
    let completeT
    const s = new Signal(emit => {
      valueS = emit.value
    })
    const t = new Signal(emit => {
      valueT = emit.value
      completeT = emit.complete
    })
    const u = new Signal(emit => {
      valueU = emit.value
    })

    concatMap(id, s).subscribe(valueSpy, errorSpy, completeSpy)

    valueS(t)
    expect(valueSpy).not.toHaveBeenCalled()
    valueT(1)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    valueS(u)
    valueT(2)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(2)
    completeT()
    valueU(3)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenLastCalledWith(3)
    valueU(4)
    expect(valueSpy).toHaveBeenCalledTimes(4)
    expect(valueSpy).toHaveBeenLastCalledWith(4)
  })

  it('emits an error when the outer signal emits an error', () => {
    let error
    const s = new Signal(emit => {
      error = emit.error
    })

    concatMap(always(), s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the outer signal is completed', () => {
    let completeS, completeT
    const s = new Signal(emit => {
      completeS = emit.complete
    })
    const t = new Signal(emit => {
      emit.value(s)
      completeT = emit.complete
    })

    concatMap(id, t).subscribe(valueSpy, errorSpy, completeSpy)

    completeS()
    expect(completeSpy).not.toHaveBeenCalled()
    completeT()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the outer signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = concatMap(id, s).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the inner signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = Signal.of(s)
    const a = concatMap(id, t).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
