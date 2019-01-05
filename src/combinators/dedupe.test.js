import Signal from '../Signal'
import dedupe from './dedupe'

let valueSpy, errorSpy, completeSpy

describe('#dedupe', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('removes duplicate values from the signal', () => {
    let a
    const s = Signal.fromCallback(callback => {
      a = a => { callback(null, a) }
    })

    dedupe(s).subscribe(valueSpy, errorSpy, completeSpy)

    a('foo')
    a('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')

    a('bar')
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })
})
