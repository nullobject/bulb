import Signal from '../Signal'
import append from './append'
import concat from './concat'

jest.mock('../Signal')
jest.mock('./concat')

describe('append', () => {
  it('calls concat', () => {
    const s = 'foo'
    const t = 'bar'

    Signal.of.mockReturnValue(t)

    append(0, s)

    expect(Signal.of).toHaveBeenCalledWith(0)
    expect(concat).toHaveBeenCalledWith(s, t)
  })
})
