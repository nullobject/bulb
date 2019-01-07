import Signal from '../Signal'
import dedupe from './dedupe'

let valueSpy, errorSpy, completeSpy

describe('dedupe', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('removes duplicate signal values', () => {
    let value
    const s = new Signal(emit => {
      value = emit.value
    })

    dedupe(s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).not.toHaveBeenCalled()
    value('foo')
    value('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')
    value('bar')
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })
})
