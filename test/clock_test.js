const assert = require('chai').assert
const clock = require('../src/clock')
const sinon = require('sinon')

describe('clock', () => {
  beforeEach(() => {
    this.clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    this.clock.restore()
  })

  describe('.interval', () => {
    it('should return a new clock signal', () => {
      const spy = sinon.spy()
      const s = clock.interval(1000)

      s.subscribe(spy)

      this.clock.tick(1000)
      this.clock.tick(1000)
      this.clock.tick(1000)

      assert.isTrue(spy.calledThrice)
      assert.isTrue(spy.calledWithExactly(1000))
    })
  })
})
