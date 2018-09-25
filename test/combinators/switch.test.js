import Signal from '../../src/signal'
import { always } from 'fkit'
import { encode, switchLatest } from '../../src/combinators/switch'

let nextSpy, errorSpy, completeSpy

describe('switch', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('#switchLatest', () => {
    it('switches to the latest signal value', () => {
      const s = Signal.of('foo')
      const t = Signal.of('bar')
      const u = Signal.sequential(1000, [s, t])

      switchLatest(u).subscribe(nextSpy, errorSpy, completeSpy)

      jest.advanceTimersByTime(1000)
      expect(nextSpy).toHaveBeenLastCalledWith('foo')

      jest.advanceTimersByTime(1000)
      expect(nextSpy).toHaveBeenLastCalledWith('bar')
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const a = switchLatest(s).subscribe(always())

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })

    it('unmounts the returned signal when it is unsubscribed', () => {
      const unmount = jest.fn()
      const s = new Signal(() => unmount)
      const t = Signal.of(s)
      const a = switchLatest(t).subscribe(always())

      a.unsubscribe()

      expect(unmount).toHaveBeenCalledTimes(1)
    })
  })

  describe('#encode', () => {
    it('encodes the signal', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })
      const t = Signal.periodic(1000).always('foo')
      const u = Signal.periodic(1000).always('bar')

      encode(s, t, u).subscribe(nextSpy, errorSpy, completeSpy)

      a(0)
      jest.advanceTimersByTime(1000)
      expect(nextSpy).toHaveBeenLastCalledWith('foo')

      a(1)
      jest.advanceTimersByTime(1000)
      expect(nextSpy).toHaveBeenLastCalledWith('bar')
    })
  })
})
