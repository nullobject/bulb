import Signal from '../Signal'
import append from './append'
import concat from './concat'
import { mockSignal } from '../emitter'

jest.mock('../Signal')
jest.mock('./concat')

describe('append', () => {
  it('calls concat', () => {
    const s = mockSignal()
    const t = mockSignal()

    Signal.fromArray.mockReturnValue(t)

    append(0, s)

    expect(Signal.fromArray).toHaveBeenCalledWith(0)
    expect(concat).toHaveBeenCalledWith(s, t)
  })
})
