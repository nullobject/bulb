import { range } from 'fkit'

import Signal from '../Signal'
import sample from './sample'

let valueSpy, errorSpy, completeSpy

describe('sample', () => {
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
    const s = Signal.periodic(1000)
    const t = Signal.periodic(500).sequential(range(1, 6))

    sample(s)(t).subscribe(valueSpy, errorSpy, completeSpy)

    jest.advanceTimersByTime(1000)
    jest.advanceTimersByTime(1000)
    jest.advanceTimersByTime(1000)

    expect(valueSpy).toHaveBeenCalledTimes(3);

    [1, 3, 5].forEach((ns, index) => {
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

    sample(s)(t).subscribe({ error: errorSpy })

    a('foo')
    b('foo')

    expect(errorSpy).toHaveBeenCalledTimes(2)
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = Signal.never()
    const a = sample(s)(t).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the sample signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = Signal.never()
    const t = new Signal(() => unmount)
    const a = sample(s)(t).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
