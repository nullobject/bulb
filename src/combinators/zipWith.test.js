import { always, range } from 'fkit'

import Signal from '../Signal'
import zipWith from './zipWith'

let valueSpy, errorSpy, completeSpy

describe('#zipWith', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('zip the corresponding signal values with a function', done => {
    const s = Signal.fromArray(range(1, 3))
    const t = Signal.fromArray(range(4, 3))
    const u = Signal.fromArray(range(7, 3))
    const f = (a, b, c) => a + b + c

    zipWith(f, s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    setTimeout(() => {
      expect(valueSpy).toHaveBeenCalledTimes(3);

      [12, 15, 18].forEach((ns, index) => {
        expect(valueSpy.mock.calls[index][0]).toEqual(ns)
      }, this)

      expect(completeSpy).toHaveBeenCalled()
      done()
    }, 0)
  })

  it('emits an error if either signal emits an error', () => {
    let a, b
    const s = Signal.fromCallback(callback => {
      a = e => { callback(e) }
    })
    const t = Signal.fromCallback(callback => {
      b = e => { callback(e) }
    })

    zipWith(always(), s, t).subscribe({ error: errorSpy })

    a('foo')
    b('foo')

    expect(errorSpy).toHaveBeenCalledTimes(2)
  })

  it('unmounts the original signals when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = new Signal(() => unmount)
    const a = zipWith(always(), s, t).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(2)
  })
})
