import Signal from '../Signal'

/**
 * Creates a mock signal to be used for testing.
 *
 * @private
 */
export default function mockSignal () {
  let value, error, complete
  const unmount = jest.fn()
  const s = new Signal(emit => {
    value = emit.value
    error = emit.error
    complete = emit.complete
    return unmount
  })
  s.value = a => { value && value(a) }
  s.error = e => { error && error(e) }
  s.complete = () => { complete && complete() }
  s.unmount = unmount
  return s
}
