import encode from './encode'
import switchLatest from './switchLatest'

jest.mock('./switchLatest')

describe('encode', () => {
  it('calls switchLatest', () => {
    const s = [0, 1]
    const t = 'foo'
    const u = 'bar'
    encode(s, t, u)
    expect(switchLatest).toHaveBeenCalledWith([t, u])
  })
})
