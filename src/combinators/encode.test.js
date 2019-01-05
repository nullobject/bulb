import Signal from '../Signal'
import encode from './encode'

let valueSpy, errorSpy, completeSpy

describe('#encode', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('encodes the signal', () => {
    let a
    const s = Signal.fromCallback(callback => {
      a = a => { callback(null, a) }
    })
    const t = Signal.periodic(1000).always('foo')
    const u = Signal.periodic(1000).always('bar')

    encode(s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    a(0)
    jest.advanceTimersByTime(1000)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')

    a(1)
    jest.advanceTimersByTime(1000)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = Signal.never()
    const u = Signal.never()
    const a = encode(s, t, u).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the encoded signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = Signal.of(0)
    const t = new Signal(() => unmount)
    const u = Signal.never()
    const a = encode(s, t, u).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
