const events = require('events')

/**
 * Returns a new event emitter that can be used as a mock object in tests.
 */
export const emitter = () => {
  const emitter = new events.EventEmitter()
  emitter.addEventListener = emitter.on
  return emitter
}
