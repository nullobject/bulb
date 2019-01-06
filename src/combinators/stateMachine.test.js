import { always, range } from 'fkit'

import Signal from '../Signal'
import stateMachine from './stateMachine'

let valueSpy, errorSpy, completeSpy

describe('#stateMachine', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('iterates a function over the signal values', () => {
    const s = Signal.fromArray(range(1, 3))

    stateMachine((a, b, emit) => {
      emit.value(a * b)
      return a + b
    })(0)(s).subscribe(valueSpy, errorSpy, completeSpy);

    [0, 2, 9].forEach((n, index) => {
      expect(valueSpy.mock.calls[index][0]).toBe(n)
    }, this)
  })

  it('emits an error if the parent signal emits an error', () => {
    const mount = jest.fn(emit => emit.error())
    const s = new Signal(mount)

    stateMachine(always())(0)(s).subscribe({ error: errorSpy })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = stateMachine(always())(0)(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
