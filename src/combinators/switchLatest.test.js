import { id } from 'fkit'

import mockSignal from '../internal/mockSignal'
import switchLatest from './switchLatest'
import { switchMap } from './switchMap'

jest.mock('fkit')
jest.mock('./switchMap')

describe('switchLatest', () => {
  it('calls switchMap', () => {
    const s = mockSignal()
    switchLatest(s)
    expect(switchMap).toHaveBeenCalledWith(id, s)
  })
})
