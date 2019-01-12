import buffer from './buffer'
import mockSignal from '../internal/mockSignal'

let s
let valueSpy, errorSpy, completeSpy

describe('buffer', () => {
  beforeEach(() => {
    s = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('buffers values emitted by the target signal', () => {
    buffer(2, s).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(1)
    expect(valueSpy).not.toHaveBeenCalled()
    s.value(2)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith([1, 2])
    s.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(1)
    s.value(4)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith([3, 4])
  })

  it('emits an error when the given signal emits an error', () => {
    buffer(0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('emits the buffer contents when the given signal is completed', () => {
    buffer(Infinity, s).subscribe(valueSpy, errorSpy, completeSpy)

    s.value(1)
    s.value(2)
    s.value(3)
    expect(valueSpy).not.toHaveBeenCalled()
    s.complete()
    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith([1, 2, 3])
  })

  it('completes when the given signal is completed', () => {
    buffer(0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = buffer(0, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
