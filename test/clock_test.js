import * as clock from '../src/clock'
import sinon from 'sinon'
import {assert} from 'chai'

let fakeClock

describe('clock', () => {
  beforeEach(() => {
    fakeClock = sinon.useFakeTimers()
  })

  afterEach(() => {
    fakeClock.restore()
  })

  describe('.interval', () => {
    it('returns a new clock signal', () => {
      const spy = sinon.spy()
      const s = clock.interval(1000)

      s.subscribe(spy)

      fakeClock.tick(1000)
      fakeClock.tick(1000)
      fakeClock.tick(1000)

      assert.isTrue(spy.calledThrice)
      assert.isTrue(spy.calledWithExactly(1000))
    })
  })
})
