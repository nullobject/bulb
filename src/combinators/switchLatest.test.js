import Signal from '../Signal'
import switchLatest from './switchLatest'

let valueSpy, errorSpy, completeSpy

describe('switchLatest', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('switches to the latest signal value', () => {
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

    switchLatest(s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    valueS(t)
    valueT('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
    valueS(u)
    valueT('foo')
    valueU('bar')
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error when any of the given signals emit an error', () => {
    let errorS, errorT
    const s = new Signal(emit => {
      errorS = emit.error
    })
    const t = new Signal(emit => {
      emit.value(s)
      errorT = emit.error
    })

    switchLatest(t).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    errorS('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenLastCalledWith('foo')
    errorT('bar')
    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenLastCalledWith('bar')
  })

  it('throws an error when the given signal emits a non-signal value', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    switchLatest(s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(() => value('foo')).toThrow('Signal value must be a signal')
  })

  it('completes when the given signal is completed', () => {
    let completeS, completeT
    const s = new Signal(emit => {
      completeS = emit.complete
    })
    const t = new Signal(emit => {
      emit.value(s)
      completeT = emit.complete
    })

    switchLatest(t).subscribe(valueSpy, errorSpy, completeSpy)

    completeS()
    expect(completeSpy).not.toHaveBeenCalled()
    completeT()
    expect(completeSpy).toHaveBeenCalled()
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = switchLatest(s).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the child signal when the returned signal is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = Signal.of(s)
    const a = switchLatest(t).subscribe()

    expect(unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
