import { range } from 'fkit'

import mockSignal from '../internal/mockSignal'
import sequential from './sequential'

let s
let nextSpy, errorSpy, completeSpy

describe('sequential', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('sequentially emits the values of an array', () => {
    const t = sequential(range(1, 3), s)

    t.subscribe(nextSpy, errorSpy, completeSpy)

    range(1, 3).forEach(n => {
      s.next()
      expect(nextSpy).toHaveBeenNthCalledWith(n, n)
    })
  })

  it('emits an error when the given signal emits an error', () => {
    sequential([], s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    sequential([], s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = sequential([], s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
