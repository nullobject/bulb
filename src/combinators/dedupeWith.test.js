import { eq } from 'fkit'

import Signal from '../Signal'
import dedupeWith from './dedupeWith'

let valueSpy, errorSpy, completeSpy

describe('#dedupeWith', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('removes duplicate values from the signal using a comparator function', () => {
    let a
    const s = Signal.fromCallback(callback => {
      a = a => { callback(null, a) }
    })

    dedupeWith(eq)(s).subscribe(valueSpy, errorSpy, completeSpy)

    a('foo')
    a('foo')
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')

    a('bar')
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })

  it('emits an error if the parent signal emits an error', () => {
    const mount = jest.fn(emit => emit.error())
    const s = new Signal(mount)

    dedupeWith(eq)(s).subscribe({ error: errorSpy })
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = dedupeWith(eq)(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
