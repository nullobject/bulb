import { id } from 'fkit'

import encode from './encode'
import mockSignal from '../internal/mockSignal'
import { switchMap } from './switchMap'

jest.mock('fkit')
jest.mock('./switchMap')

describe('encode', () => {
  it('calls switchMap', () => {
    const s = [0, 1]
    const t = mockSignal()
    const u = mockSignal()

    encode(s, t, u)

    expect(switchMap).toHaveBeenCalledWith(id, [t, u])
  })
})
