v1.1.0 / 2018-01-12
===================

  * Fix an issue with Signal.fromEvent
  * Update documentation
  * Rename bulb.js -> index.js
  * Rename combinator -> combinators

v1.0.0 / 2018-01-02
===================

  * Update rollup to 0.53.2
  * Update jsdoc-react to 1.0.0
  * Update fkit to 1.1.0
  * Update mocha to 4.1.0
  * Update documentation
  * Refactor keyboard and mouse modules
  * Add Signal#throttle and Signal#debounce
  * Add throttle function
  * Add debounce function
  * Curry the combinator functions
  * Extract combinators into modules
  * Update zipWith function to buffer values
  * Rename license to licence
  * Remove sampleWith and holdWith functions
  * Ensure signal combinators are unsubscribed
  * Add Signal#encode
  * Add Signal#switch
  * Allow Signal#merge to receieve signals as an array
  * Update copyright in license
  * Don't export default from main module
  * Rename observer -> emit
  * Refactor subscribe calls to use object reset spread

v0.4.0 / 2017-12-18
===================

  * Fix rollup packaging
  * Allow merge to take many arguments
  * Refactor stateMachine to take observer argument

v0.3.2 / 2017-12-17
===================

  * Store keyboard state in a set
  * Add Signal#startWith function

v0.3.1 / 2017-12-16
===================

  * Don't generate duplicate keyboard events
  * Handle no transform function result in Signal#stateMachine

v0.3.0 / 2017-12-16
===================

  * Add Signal#stateMachine function

v0.2.0 / 2017-12-16
===================

  * First cut of the API.

v0.1.0 / 2014-11-06
===================

  * Initial import.
