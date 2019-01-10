import Signal from './Signal'
import events from 'events'

/**
 * Returns a new event emitter that can be used as a mock object in tests.
 *
 * @private
 */
export default function emitter () {
  const emitter = new events.EventEmitter()
  emitter.addEventListener = emitter.on
  emitter.removeEventListener = jest.fn()
  return emitter
}

export function mockSignal () {
  let value, error, complete
  const unmount = jest.fn()
  const s = new Signal(emit => {
    value = emit.value
    error = emit.error
    complete = emit.complete
    return () => unmount
  })
  s.value = a => { value && value(a) }
  s.error = e => { error && error(e) }
  s.complete = () => { complete && complete() }
  s.unmount = unmount
  return s
}
