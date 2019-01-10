import Signal from '../Signal'
import concat from './concat'
import endWith from './endWith'

jest.mock('../Signal')
jest.mock('./concat')

describe('endWith', () => {
  it('calls concat', () => {
    const s = 'foo'
    const t = 'bar'

    Signal.of.mockReturnValue(t)

    endWith(0, s)

    expect(Signal.of).toHaveBeenCalledWith(0)
    expect(concat).toHaveBeenCalledWith(s, t)
  })
})
