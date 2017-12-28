import Signal from '../../src/signal'
import sinon from 'sinon'
import {range} from 'fkit'
import {assert} from 'chai'
import {delay} from '../../src/combinator/delay'

let nextSpy, errorSpy, completeSpy, clock

describe('delay', () => {
  beforeEach(() => {
    nextSpy = sinon.spy()
    errorSpy = sinon.spy()
    completeSpy = sinon.spy()
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  describe('#delay', () => {
    it('delays the signal values', () => {
      const s = Signal.fromArray(range(1, 3))

      delay(1000, s).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.called)

      clock.tick(1000)

      range(1, 3).forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      delay(1000, s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })
})
