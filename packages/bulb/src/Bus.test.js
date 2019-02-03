import Bus from './Bus'
import mockSignal from './internal/mockSignal'

let valueSpy, errorSpy, completeSpy
let bus

describe('Bus', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()

    bus = new Bus()
    bus.subscribe(valueSpy, errorSpy, completeSpy)
  })

  describe('#value', () => {
    it('emits a given value', () => {
      bus.value(1)
      expect(valueSpy).toHaveBeenLastCalledWith(1)
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
      s.value(1)
      expect(valueSpy).toHaveBeenLastCalledWith(1)
    })

    it('forwards errors emitted by the given signal to the bus', () => {
      const s = mockSignal()
      bus.connect(s)
      s.error(1)
      expect(errorSpy).toHaveBeenLastCalledWith(1)
    })
  })
})
