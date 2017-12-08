const assert = require('chai').assert
const clock = require('../src/clock')
const sinon = require('sinon')

describe('clock', function () {
  beforeEach(function () {
    this.clock = sinon.useFakeTimers()
  })

  afterEach(function () {
    this.clock.restore()
  })

  describe('.interval', function () {
    it('should return a new clock signal', function () {
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
