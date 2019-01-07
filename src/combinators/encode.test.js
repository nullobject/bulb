import Signal from '../Signal'
import encode from './encode'

let valueSpy, errorSpy, completeSpy

describe('encode', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('encodes the given signals with the control signal', () => {
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

    encode(s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    valueS(0)
    valueT('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
    valueS(1)
    valueT('foo')
    valueU('bar')
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when the control signal emits an error', () => {
    let error
    const s = new Signal(emit => {
      error = emit.error
    })

    encode(s, []).subscribe(valueSpy, errorSpy, completeSpy)

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

    encode(s, []).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the control signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = Signal.never()
    const u = Signal.never()
    const a = encode(s, t, u).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the encoded signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = Signal.of(0)
    const t = new Signal(() => unmount)
    const u = Signal.never()
    const a = encode(s, t, u).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
