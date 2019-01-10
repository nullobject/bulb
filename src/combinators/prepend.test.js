import Signal from '../Signal'
import concat from './concat'
import mockSignal from '../internal/mockSignal'
import prepend from './prepend'

jest.mock('../Signal')
jest.mock('./concat')

describe('prepend', () => {
  it('calls concat', () => {
    const s = mockSignal()
    const t = mockSignal()

    Signal.fromArray.mockReturnValue(t)

    prepend(0, s)

    expect(Signal.fromArray).toHaveBeenCalledWith(0)
    expect(concat).toHaveBeenCalledWith(t, s)
  })
})
