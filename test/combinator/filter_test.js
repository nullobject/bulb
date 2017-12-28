import Signal from '../../src/signal'
import sinon from 'sinon'
import {always, equal, range} from 'fkit'
import {assert} from 'chai'
import {dedupe, dedupeWith, filter} from '../../src/combinator/filter'

let nextSpy, errorSpy, completeSpy

describe('filter', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
  })

  describe('#filter', () => {
    it('filters the signal values with a predicate', () => {
      const s = Signal.fromArray(range(1, 3))

      filter(equal(2), s).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isTrue(nextSpy.alwaysCalledWithExactly(2))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      filter(always(), s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#dedupe', () => {
    it('removes duplicate values from the signal', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })

      dedupe(s).subscribe(nextSpy, errorSpy, completeSpy)

      a('foo')
      a('foo')
      assert.isTrue(nextSpy.firstCall.calledWithExactly('foo'))

      a('bar')
      assert.isTrue(nextSpy.secondCall.calledWithExactly('bar'))
    })
  })

  describe('#dedupeWith', () => {
    it('removes duplicate values from the signal using a comparator function', () => {
      let a
      const s = Signal.fromCallback(callback => {
        a = a => { callback(null, a) }
      })

      dedupeWith(equal, s).subscribe(nextSpy, errorSpy, completeSpy)

      a('foo')
      a('foo')
      assert.isTrue(nextSpy.firstCall.calledWithExactly('foo'))

      a('bar')
      assert.isTrue(nextSpy.secondCall.calledWithExactly('bar'))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      dedupeWith(equal, s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })
})
