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

  it('emits an error when the given signal emits an error', () => {
    let error
    const s = new Signal(emit => {
      error = emit.error
    })

    switchLatest(s).subscribe(valueSpy, errorSpy, completeSpy)

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

    switchLatest(s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
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
