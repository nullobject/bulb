import { range } from 'fkit'

import cycle from './cycle'
import mockSignal from '../internal/mockSignal'

let s
let nextSpy, errorSpy, completeSpy

describe('cycle', () => {
  beforeEach(() => {
    s = mockSignal()

    nextSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('cycles through the values of an array', () => {
    const t = cycle(range(1, 3), s)

    t.subscribe(nextSpy, errorSpy, completeSpy)

    range(0, 6).forEach(n => {
      s.next()
      expect(nextSpy).toHaveBeenNthCalledWith(n + 1, (n % 3) + 1)
    })
  })

  it('emits an error when the given signal emits an error', () => {
    cycle([], s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    cycle([], s).subscribe(nextSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = cycle([], s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
