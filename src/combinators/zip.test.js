import Signal from '../Signal'
import zip from './zip'

let valueSpy, errorSpy, completeSpy

describe('zip', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('zips the corresponding signal values into tuples', () => {
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

    zip(s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    valueS(1)
    valueT(2)
    expect(valueSpy).not.toHaveBeenCalled()
    valueU(3)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenCalledWith([1, 2, 3])
  })
})
