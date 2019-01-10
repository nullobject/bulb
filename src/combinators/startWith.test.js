import Signal from '../Signal'
import concat from './concat'
import startWith from './startWith'

jest.mock('../Signal')
jest.mock('./concat')

describe('startWith', () => {
  it('calls concat', () => {
    const s = 'foo'
    const t = 'bar'

    Signal.of.mockReturnValue(t)

    startWith(0, s)

    expect(Signal.of).toHaveBeenCalledWith(0)
    expect(concat).toHaveBeenCalledWith(t, s)
  })
})
