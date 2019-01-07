import Signal from '../Signal'
import switchLatest from './switchLatest'

let valueSpy, errorSpy, completeSpy

describe('switchLatest', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('switches to the latest signal value', () => {
    const s = Signal.of('foo')
    const t = Signal.of('bar')
    const u = Signal.periodic(1000).sequential([s, t])

    switchLatest(u).subscribe(valueSpy, errorSpy, completeSpy)

    jest.advanceTimersByTime(1000)
    expect(valueSpy).toHaveBeenLastCalledWith('foo')

    jest.advanceTimersByTime(1000)
    expect(valueSpy).toHaveBeenLastCalledWith('bar')
  })

  it('unmounts the original signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const a = switchLatest(s).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })

  it('unmounts the returned signal when it is unsubscribed', () => {
    const unmount = jest.fn()
    const s = new Signal(() => unmount)
    const t = Signal.of(s)
    const a = switchLatest(t).subscribe()

    a.unsubscribe()

    expect(unmount).toHaveBeenCalledTimes(1)
  })
})
