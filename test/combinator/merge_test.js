import Signal from '../../src/signal'
import sinon from 'sinon'
import {always, range} from 'fkit'
import {assert} from 'chai'
import {merge} from '../../src/combinator/merge'

let nextSpy, errorSpy, completeSpy, clock

describe('merge', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  describe('#merge', () => {
    it('merges the signals', () => {
      const s = Signal.sequential(1000, range(1, 3))
      const t = Signal.sequential(1000, range(4, 3))
      const u = Signal.sequential(1000, range(7, 3))

      merge(s, t, u).subscribe(nextSpy, errorSpy, completeSpy)

      clock.tick(1000)
      clock.tick(1000)
      clock.tick(1000)

      assert.strictEqual(nextSpy.callCount, 9);

      [1, 4, 7, 2, 5, 8, 3, 6, 9].forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
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

      merge(s, t).subscribe({error: errorSpy})

      a('foo')
      b('foo')

      assert.isTrue(errorSpy.calledTwice)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = new Signal(() => unmount)
      const t = Signal.never()
      const a = merge(s, t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })

    it('unmounts the merged signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = Signal.never()
      const t = new Signal(() => unmount)
      const a = merge(s, t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })
})
