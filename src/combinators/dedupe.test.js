import { eq } from 'fkit'

import dedupe from './dedupe'
import mockSignal from '../internal/mockSignal'
import { dedupeWith } from './dedupeWith'

jest.mock('fkit')
jest.mock('./dedupeWith')

describe('dedupe', () => {
  it('calls dedupeWith', () => {
    const s = mockSignal()
    dedupe(s)
    expect(dedupeWith).toHaveBeenCalledWith(eq, s)
  })
})
