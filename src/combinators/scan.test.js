import { add, always } from 'fkit'

import scan from './scan'
import { asap } from '../scheduler'
import { mockSignal } from '../emitter'

jest.mock('../scheduler')

let s
let valueSpy, errorSpy, completeSpy

describe('scan', () => {
  beforeEach(() => {
    s = mockSignal()

    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()

    asap.mockImplementation(f => f())
  })

  afterEach(() => {
    asap.mockRestore()
  })

  it('scans a function over the signal values', () => {
    scan(add, 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).toHaveBeenCalledTimes(1)
    expect(valueSpy).toHaveBeenLastCalledWith(0)
    s.value(1)
    expect(valueSpy).toHaveBeenCalledTimes(2)
    expect(valueSpy).toHaveBeenLastCalledWith(1)
    s.value(2)
    expect(valueSpy).toHaveBeenCalledTimes(3)
    expect(valueSpy).toHaveBeenLastCalledWith(3)
    s.value(3)
    expect(valueSpy).toHaveBeenCalledTimes(4)
    expect(valueSpy).toHaveBeenLastCalledWith(6)
  })

  it('emits an error when the given signal emits an error', () => {
    scan(always(), 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(errorSpy).not.toHaveBeenCalled()
    s.error('foo')
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith('foo')
  })

  it('completes when the given signal is completed', () => {
    scan(always(), 0, s).subscribe(valueSpy, errorSpy, completeSpy)

    expect(completeSpy).not.toHaveBeenCalled()
    s.complete()
    expect(completeSpy).toHaveBeenCalledTimes(1)
  })

  it('unmounts the given signal when the returned signal is unsubscribed', () => {
    const a = scan(always(), 0, s).subscribe()

    expect(s.unmount).not.toHaveBeenCalled()
    a.unsubscribe()
    expect(s.unmount).toHaveBeenCalledTimes(1)
  })
})
