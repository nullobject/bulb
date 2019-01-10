import Signal from '../Signal'
import concat from './concat'
import prepend from './prepend'

jest.mock('../Signal')
jest.mock('./concat')

describe('prepend', () => {
  it('calls concat', () => {
    const s = 'foo'
    const t = 'bar'

    Signal.of.mockReturnValue(t)

    prepend(0, s)

    expect(Signal.of).toHaveBeenCalledWith(0)
    expect(concat).toHaveBeenCalledWith(t, s)
  })
})
