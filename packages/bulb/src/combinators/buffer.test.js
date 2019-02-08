import buffer from './buffer'
import mockSignal from '../internal/mockSignal'

let s
let nextSpy, errorSpy, completeSpy

describe('buffer', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('buffers values emitted by the target signal', () => {
    buffer(2, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    expect(nextSpy).not.toHaveBeenCalled()
    s.next(2)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith([1, 2])
    s.next(3)
    expect(nextSpy).toHaveBeenCalledTimes(1)
    s.next(4)
    expect(nextSpy).toHaveBeenCalledTimes(2)
    expect(nextSpy).toHaveBeenLastCalledWith([3, 4])
  })

  it('emits an error when the given signal emits an error', () => {
    buffer(0, s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('emits the buffer contents when the given signal is completed', () => {
    buffer(Infinity, s).subscribe(nextSpy, errorSpy, completeSpy)

    s.next(1)
    s.next(2)
    s.next(3)
    expect(nextSpy).not.toHaveBeenCalled()
    s.complete()
    expect(nextSpy).toHaveBeenCalledTimes(1)
    expect(nextSpy).toHaveBeenLastCalledWith([1, 2, 3])
  })

  it('completes when the given signal is completed', () => {
    buffer(0, s).subscribe(nextSpy, errorSpy, completeSpy)

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
