import Signal from '../../src/signal'
import sinon from 'sinon'
import {always, range} from 'fkit'
import {assert} from 'chai'
import {zip, zipWith} from '../../src/combinator/zip'

let nextSpy, errorSpy, completeSpy

describe('zip', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
  })

  describe('#zip', () => {
    it('zips the corresponding signal values into tuples', () => {
      const s = Signal.fromArray(range(1, 3))
      const t = Signal.fromArray(range(4, 3))
      const u = Signal.fromArray(range(7, 3))

      zip(s, t, u).subscribe(nextSpy, errorSpy, completeSpy)

      assert.strictEqual(nextSpy.callCount, 3);

      [[1, 4, 7], [2, 5, 8], [3, 6, 9]].forEach((ns, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(ns))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })
  })

  describe('#zipWith', () => {
    it('zip the corresponding signal values with a function', () => {
      const s = Signal.fromArray(range(1, 3))
      const t = Signal.fromArray(range(4, 3))
      const u = Signal.fromArray(range(7, 3))
      const f = (a, b, c) => a + b + c

      zipWith(f, s, t, u).subscribe(nextSpy, errorSpy, completeSpy)

      assert.strictEqual(nextSpy.callCount, 3);

      [12, 15, 18].forEach((ns, index) => {
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

      zipWith(always(), s, t).subscribe({error: errorSpy})

      a('foo')
      b('foo')

      assert.isTrue(errorSpy.calledTwice)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = new Signal(() => unmount)
      const t = Signal.never()
      const a = zipWith(always(), s, t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })

    it('unmounts the zipped signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = Signal.never()
      const t = new Signal(() => unmount)
      const a = zipWith(always(), s, t).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })
})
