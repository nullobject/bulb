import Signal from '../../src/signal'
import sinon from 'sinon'
import {add, always, range} from 'fkit'
import {assert} from 'chai'
import {fold, scan, stateMachine} from '../../src/combinator/fold'

let nextSpy, errorSpy, completeSpy

describe('fold', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
  })

  describe('#fold', () => {
    it('folds a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      fold(add)(0)(s).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isTrue(nextSpy.calledWithExactly(6))
      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      fold(always())(0)(s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#scan', () => {
    it('scans a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      scan(add)(0)(s).subscribe(nextSpy, errorSpy, completeSpy);

      [0, 1, 3, 6].forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      scan(always())(0)(s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#stateMachine', () => {
    it('iterates a function over the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      stateMachine((a, b, emit) => {
        emit.next(a * b)
        return a + b
      })(0)(s).subscribe(nextSpy, errorSpy, completeSpy);

      [0, 2, 9].forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      stateMachine(always())(0)(s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })
})
