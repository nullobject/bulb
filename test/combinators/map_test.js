import Signal from '../../src/signal'
import sinon from 'sinon'
import {always, inc, range} from 'fkit'
import {assert} from 'chai'
import {concatMap, map} from '../../src/combinators/map'

let nextSpy, errorSpy, completeSpy

describe('map', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
  })

  describe('#concatMap', () => {
    it('maps a function over the signal values', done => {
      const s = Signal.fromArray(range(1, 3))
      const f = a => Signal.of(a)

      concatMap(f)(s).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        range(1, 3).forEach((n, index) => {
          const call = nextSpy.getCall(index)
          assert.isTrue(call.calledWithExactly(n))
        }, this)

        assert.isTrue(completeSpy.calledAfter(nextSpy))
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      concatMap(always())(s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })

    it('unmounts the original signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = new Signal(() => unmount)
      const f = a => Signal.of(a)
      const a = concatMap(f)(s).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })

    it('unmounts the returned signal when it is unsubscribed', () => {
      const unmount = sinon.spy()
      const s = Signal.of(0)
      const f = a => new Signal(() => unmount)
      const a = concatMap(f)(s).subscribe(always())

      a.unsubscribe()

      assert.isTrue(unmount.calledOnce)
    })
  })

  describe('#map', () => {
    it('maps a function over the signal values', done => {
      const s = Signal.fromArray(range(1, 3))

      map(inc)(s).subscribe(nextSpy, errorSpy, completeSpy)

      setTimeout(() => {
        range(2, 3).forEach((n, index) => {
          const call = nextSpy.getCall(index)
          assert.isTrue(call.calledWithExactly(n))
        }, this)

        assert.isTrue(completeSpy.calledAfter(nextSpy))
        done()
      }, 0)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      map(always())(s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })
})
