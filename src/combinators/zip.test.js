import mockSignal from '../internal/mockSignal'
import zip, { tuple } from './zip'
import zipWith from './zipWith'

jest.mock('./zipWith')

describe('tuple', () => {
  it('creates a tuple from the given values', () => {
    expect(tuple(1)).toEqual([1])
    expect(tuple(1, 2)).toEqual([1, 2])
    expect(tuple(1, 2, 3)).toEqual([1, 2, 3])
  })
})

describe('zip', () => {
  it('calls zipWith', () => {
    const s = mockSignal()
    const t = mockSignal()
    const u = mockSignal()

    zip(s, t, u)

    expect(zipWith).toHaveBeenCalledWith(tuple, [s, t, u])
  })
})
