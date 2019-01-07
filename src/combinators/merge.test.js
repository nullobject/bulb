import { range } from 'fkit'

import Signal from '../Signal'
import merge from './merge'

let valueSpy, errorSpy, completeSpy

describe('merge', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('merges the signals', () => {
    const s = Signal.periodic(1000).sequential(range(1, 3))
    const t = Signal.periodic(1000).sequential(range(4, 3))
    const u = Signal.periodic(1000).sequential(range(7, 3))

    merge(s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    jest.advanceTimersByTime(1000)
    jest.advanceTimersByTime(1000)
    jest.advanceTimersByTime(1000)

    expect(valueSpy).toHaveBeenCalledTimes(9);

    [1, 4, 7, 2, 5, 8, 3, 6, 9].forEach((n, index) => {
      expect(valueSpy.mock.calls[index][0]).toBe(n)
    }, this)

    expect(completeSpy).toHaveBeenCalled()
  })

  it('emits an error if either signal emits an error', () => {
    let a, b
    const s = Signal.fromCallback(callback => {
      a = e => { callback(e) }
    })
    const t = Signal.fromCallback(callback => {
      b = e => { callback(e) }
    })

    merge(s, t).subscribe({ error: errorSpy })

    a('foo')
    b('foo')

    expect(errorSpy).toHaveBeenCalledTimes(2)
  })

  it('unmounts the original signals when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = new Signal(() => unmount)
    const u = new Signal(() => unmount)
    const a = merge(s, t, u).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(3)
  })
})
