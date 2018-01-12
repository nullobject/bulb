import Signal from '../../src/signal'
import sinon from 'sinon'
import {range} from 'fkit'
import {assert} from 'chai'
import {debounce, delay, throttle} from '../../src/combinators/delay'

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

      delay(1000)(s).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.called)

      clock.tick(1000)

      assert.isTrue(nextSpy.calledThrice)

      range(1, 3).forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      delay(1000)(s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#debounce', () => {
    it('debounces the signal values', () => {
      const s = Signal.sequential(100, range(1, 3))

      debounce(1000)(s).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.called)

      clock.tick(1000)

      assert.isTrue(nextSpy.calledOnce)
      assert.isTrue(nextSpy.calledWithExactly(3))

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      debounce(1000)(s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })

  describe('#throttle', () => {
    it('throttle the signal values', () => {
      const s = Signal.sequential(500, range(1, 3))

      throttle(1000)(s).subscribe(nextSpy, errorSpy, completeSpy)

      assert.isFalse(nextSpy.called)

      clock.tick(500)
      clock.tick(500)
      clock.tick(500)

      assert.isTrue(nextSpy.calledTwice);

      [1, 3].forEach((n, index) => {
        const call = nextSpy.getCall(index)
        assert.isTrue(call.calledWithExactly(n))
      }, this)

      assert.isTrue(completeSpy.calledAfter(nextSpy))
    })

    it('emits an error if the parent signal emits an error', () => {
      const mount = sinon.stub().callsFake(emit => emit.error())
      const s = new Signal(mount)

      throttle(1000)(s).subscribe({error: errorSpy})
      assert.isTrue(errorSpy.calledOnce)
    })
  })
})
