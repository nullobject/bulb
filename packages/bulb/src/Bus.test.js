import { Bus } from './Bus'
import mockSignal from './internal/mockSignal'

let nextSpy, errorSpy, completeSpy
let bus

describe('Bus', () => {
  beforeEach(() => {
    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()

    bus = new Bus()
    bus.subscribe(nextSpy, errorSpy, completeSpy)
  })

  describe('#value', () => {
    it('emits a given value', () => {
      bus.next(1)
      expect(nextSpy).toHaveBeenLastCalledWith(1)
    })
  })

  describe('#error', () => {
    it('emits a given error', () => {
      bus.error(1)
      expect(errorSpy).toHaveBeenLastCalledWith(1)
    })
  })

  describe('#complete', () => {
    it('completes the bus', () => {
      bus.complete()
      expect(completeSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('#connect', () => {
    it('forwards values emitted by the given signal to the bus', () => {
      const s = mockSignal()
      bus.connect(s)
      s.next(1)
      expect(nextSpy).toHaveBeenLastCalledWith(1)
    })

    it('forwards errors emitted by the given signal to the bus', () => {
      const s = mockSignal()
      bus.connect(s)
      s.error(1)
      expect(errorSpy).toHaveBeenLastCalledWith(1)
    })
  })
})
