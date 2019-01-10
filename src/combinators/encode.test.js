import encode from './encode'
import mockSignal from '../internal/mockSignal'
import switchLatest from './switchLatest'

jest.mock('./switchLatest')

describe('encode', () => {
  it('calls switchLatest', () => {
    const s = [0, 1]
    const t = mockSignal()
    const u = mockSignal()

    encode(s, t, u)

    expect(switchLatest).toHaveBeenCalledWith([t, u])
  })
})
