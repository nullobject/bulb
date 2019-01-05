import events from 'events'

/**
 * Returns a new event emitter that can be used as a mock object in tests.
 *
 * @private
 */
export const emitter = () => {
  const emitter = new events.EventEmitter()
  emitter.addEventListener = emitter.on
  emitter.removeEventListener = jest.fn()
  return emitter
}
