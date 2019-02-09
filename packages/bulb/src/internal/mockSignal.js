import Signal from '../Signal'

/**
 * Creates a mock signal to be used for testing.
 *
 * @private
 */
export default function mockSignal () {
  let next, error, complete
  const unmount = jest.fn()
  const s = new Signal(emit => {
    next = emit.next
    error = emit.error
    complete = emit.complete
    return unmount
  })
  s.next = a => { next && next(a) }
  s.error = e => { error && error(e) }
  s.complete = () => { complete && complete() }
  s.unmount = unmount
  return s
}
