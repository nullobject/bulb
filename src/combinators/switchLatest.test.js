import { id } from 'fkit'

import switchLatest from './switchLatest'
import { switchMap } from './switchMap'

jest.mock('fkit')
jest.mock('./switchMap')

describe('switchLatest', () => {
  it('calls switchMap', () => {
    const s = 'foo'
    switchLatest(s)
    expect(switchMap).toHaveBeenCalledWith(id, s)
  })
})
