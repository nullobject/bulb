import Signal from '../../src/signal'
import sinon from 'sinon'
import {always} from 'fkit'
import {assert} from 'chai'
import {encode, switchLatest} from '../../src/combinator/switch'

let nextSpy, errorSpy, completeSpy, clock

describe('switch', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  describe('#switchLatest', () => {
    it('switches to the latest signal value', () => {
      const s = Signal.of('foo')
      const t = Signal.of('bar')
      const u = Signal.sequential(1000, [s, t])

      switchLatest(u).subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      assert.isTrue(nextSpy.firstCall.calledWithExactly('foo'))

      clock.tick(1000)
      assert.isTrue(nextSpy.secondCall.calledWithExactly('bar'))
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = new Signal(() => unmount)
      const a = switchLatest(s).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })

    it('unmounts the returned signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = new Signal(() => unmount)
      const t = Signal.of(s)
      const a = switchLatest(t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
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
      clock.tick(1000)
      assert.isTrue(nextSpy.firstCall.calledWithExactly('foo'))

      a(1)
      clock.tick(1000)
      assert.isTrue(nextSpy.secondCall.calledWithExactly('bar'))
    })
  })
})
