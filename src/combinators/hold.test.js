import { range } from 'fkit'

import Signal from '../Signal'
import hold from './hold'

let valueSpy, errorSpy, completeSpy

describe('#hold', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('emits the most recent value when there is an event on the sampler signal', () => {
    let a
    const s = Signal.fromCallback(callback => {
      a = a => { callback(null, a) }
    })
    const t = Signal.sequential(500, range(1, 6))

    hold(s)(t).subscribe(valueSpy, errorSpy, completeSpy)

    a(false)
    jest.advanceTimersByTime(1000)
    a(true)
    jest.advanceTimersByTime(1000)
    a(false)
    jest.advanceTimersByTime(1000)

    expect(valueSpy).toHaveBeenCalledTimes(4);

    [1, 2, 5, 6].forEach((ns, index) => {
      expect(valueSpy.mock.calls[index][0]).toEqual(ns)
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

    hold(s)(t).subscribe({ error: errorSpy })

    a('foo')
    b('foo')

    expect(errorSpy).toHaveBeenCalledTimes(2)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = Signal.never()
    const a = hold(s)(t).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the held signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = Signal.never()
    const t = new Signal(() => unmount)
    const a = hold(s)(t).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
