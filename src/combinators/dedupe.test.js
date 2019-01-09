import { eq } from 'fkit'

import dedupe from './dedupe'
import { dedupeWith } from './dedupeWith'

jest.mock('fkit')
jest.mock('./dedupeWith')

describe('dedupe', () => {
  it('calls dedupeWith', () => {
    const s = 'foo'
    dedupe(s)
    expect(dedupeWith).toHaveBeenCalledWith(eq, s)
  })
})
