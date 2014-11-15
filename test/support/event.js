'use strict';

var events = require('events');

/**
 * Returns a new event emitter that can be used as a mock object in tests.
 */
exports.emitter = function() {
  var emitter = new events.EventEmitter();
  emitter.addEventListener = emitter.on;
  return emitter;
}
