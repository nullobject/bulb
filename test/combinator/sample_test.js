import Signal from '../../src/signal'
import sinon from 'sinon'
import {always, range} from 'fkit'
import {assert} from 'chai'
import {sample, hold} from '../../src/combinator/sample'

let nextSpy, errorSpy, completeSpy, clock

describe('sample', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  describe('#sample', () => {
    it('emits the most recent value when there is an event on the sampler signal', () => {
      const s = Signal.periodic(1000)
      const t = Signal.sequential(500, range(1, 6))

      sample(s, t).subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      clock.tick(1000)
      clock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 3);

      [1, 3, 5].forEach((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if either signal emits an error', () => {
      let a, b
      const s = Signal.fromCallback(callback => {
        a = e => { callback(e) }
      })
      const t = Signal.fromCallback(callback => {
        b = e => { callback(e) }
      })

      sample(s, t).subscribe({error: errorSpy})

      a('foo')
      b('foo')

      assert.isTrue(errorSpy.calledTwice)
    })
  })

  describe('#hold', () => {
    it('emits the most recent value when there is an event on the sampler signal', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })
      const t = Signal.sequential(500, range(1, 6))

      hold(s, t).subscribe(nextSpy, errorSpy, completeSpy)

      a(false)
      clock.tick(1000)
      a(true)
      clock.tick(1000)
      a(false)
      clock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 4);

      [1, 2, 5, 6].forEach((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if either signal emits an error', () => {
      let a, b
      const s = Signal.fromCallback(callback => {
        a = e => { callback(e) }
      })
      const t = Signal.fromCallback(callback => {
        b = e => { callback(e) }
      })

      hold(s, t).subscribe({error: errorSpy})

      a('foo')
      b('foo')

      assert.isTrue(errorSpy.calledTwice)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = new Signal(() => unmount)
      const t = Signal.never()
      const a = hold(s, t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })

    it('unmounts the sampler when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = Signal.never()
      const t = new Signal(() => unmount)
      const a = hold(s, t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })
})
