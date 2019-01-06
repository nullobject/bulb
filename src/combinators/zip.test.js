import { range } from 'fkit'

import Signal from '../Signal'
import zip from './zip'

let valueSpy, errorSpy, completeSpy

describe('#zip', () => {
  beforeEach(() => {
    valueSpy = jest.fn()
    errorSpy = jest.fn()
    completeSpy = jest.fn()
  })

  it('zips the corresponding signal values into tuples', () => {
    const s = Signal.fromArray(range(1, 3))
    const t = Signal.fromArray(range(4, 3))
    const u = Signal.fromArray(range(7, 3))

    zip(s, t, u).subscribe(valueSpy, errorSpy, completeSpy)

    expect(valueSpy).toHaveBeenCalledTimes(3);

    [[1, 4, 7], [2, 5, 8], [3, 6, 9]].forEach((ns, index) => {
      expect(valueSpy.mock.calls[index][0]).toEqual(ns)
    }, this)

    expect(completeSpy).toHaveBeenCalled()
  })
})
