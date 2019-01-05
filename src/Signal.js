import { always, apply, empty, head, tail } from 'fkit'

import Subscription from './Subscription'
import dedupe from './combinators/dedupe'
import encode from './combinators/encode'
import merge from './combinators/merge'
import switchLatest from './combinators/switchLatest'
import zip from './combinators/zip'
import zipWith from './combinators/zipWith'
import { concatMap } from './combinators/concatMap'
import { debounce } from './combinators/debounce'
import { dedupeWith } from './combinators/dedupeWith'
import { delay } from './combinators/delay'
import { filter } from './combinators/filter'
import { fold } from './combinators/fold'
import { hold } from './combinators/hold'
import { map } from './combinators/map'
import { sample } from './combinators/sample'
import { scan } from './combinators/scan'
import { stateMachine } from './combinators/stateMachine'
import { throttle } from './combinators/throttle'

/**
 * Creates a callback function that emits values to a list of subscribers.
 *
 * @private
 * @param {Array} subscriptions An array of subscriptions.
 * @param {String} type The type of callback to create.
 * @returns {Function} A function that emits a value to all of the subscriptions.
 */
function emitter (subscriptions, type) {
  return value => {
    subscriptions.forEach(s => {
      if (typeof s.emit[type] === 'function') {
        s.emit[type](value)
      }
    })
  }
}

/**
 * The `Signal` class represents a time-varying source of values – for example,
 * the value of a text input, a periodic timer, or even the position of the
 * mouse pointer in the browser window.
 *
 * When creating a new signal you must provide a `mount` function, which when
 * called will connect the signal to a source of values. This function will
 * only be called once an observer has subscribed to the signal. This is
 * because signals are lazy – they don't bother emitting values until an
 * observer is listening.
 *
 * The `mount` function takes an `emit` object as its only argument. This
 * allows the signal to emit values:
 *
 * * `emit.value(a)` - Emits the value `a`.
 * * `emit.error(e)` - Emits the error `e`.
 * * `emit.complete()` - Marks the signal as complete.
 *
 * The `mount` function can also optionally return an unmount function, which
 * when called will disconnect the signal from its source of values. This
 * function will only be called once all observers have unsubscribed from the
 * signal.
 *
 * @param {Function} mount The function that is used to connect the signal with
 * a source of values. It can optionally return an unmount function.
 *
 * @example
 *
 * // Create a signal that emits the value 'foo' every second.
 * const signal = new Signal(emit => {
 *   // Start the timer and emit a value whenever the timer fires.
 *   const id = setInterval(() => emit.value('foo'), 1000)
 *
 *   // Return a function to be called when the signal is unmounted.
 *   return () => clearInterval(id)
 * })
 *
 * // Subscribe to the signal and log the emitted values to the console.
 * const subscription = signal.subscribe(console.log)
 *
 * // Once we are done, we can unsubscribe from the signal.
 * subscription.unsubscribe()
 */
export default class Signal {
  constructor (mount) {
    if (typeof mount !== 'function') {
      throw new TypeError('Signal mount must be a function')
    }

    this._mount = mount
    this._unmount = null
    this._subscriptions = new Set()
  }

  /**
   * Mounts the signal.
   *
   * @private
   */
  mount (emit) {
    try {
      // Mount the signal and store the reference to the unmount function.
      this._unmount = this._mount(emit)
    } catch (e) {
      emit.error(e)
    }
  }

  /**
   * Unmounts the signal.
   *
   * @private
   */
  unmount () {
    if (typeof this._unmount === 'function') {
      try {
        this._unmount()
      } catch (e) {}
    }

    this._unmount = null
  }

  /**
   * Subscribes to the signal to handle emitted values.
   *
   * @param {Function} [value] The callback function called when the signal
   * emits a value.
   * @param {Function} [error] The callback function called when the signal
   * emits an error.
   * @param {Function} [complete] The callback function called when the signal
   * has completed.
   * @returns {Subscription} A new subscription.
   */
  subscribe (value, error, complete) {
    let emit = {}

    if (typeof value === 'function') {
      emit = { value, error, complete }
    } else if (typeof value === 'object') {
      emit = value
    }

    // Create a new subscription to the signal.
    const subscription = new Subscription(emit, () => {
      // Remove the subscription.
      this._subscriptions.delete(subscription)

      // Call the unmount function if we're removing the last subscription.
      if (this._subscriptions.size === 0) {
        this.unmount()
      }
    })

    // Add the subscription.
    this._subscriptions.add(subscription)

    // Call the mount function if we're adding the first subscription.
    if (this._subscriptions.size === 1) {
      this.mount({
        value: emitter(this._subscriptions, 'value'),
        error: emitter(this._subscriptions, 'error'),
        complete: emitter(this._subscriptions, 'complete')
      })
    }

    return subscription
  }

  /**
   * Returns a signal that never emits any values and has already completed.
   *
   * This method is not very useful on its own, but it can be used with other
   * combinators (e.g. `fold`, `scan`, etc).
   *
   * @returns {Signal} A new signal.
   */
  static empty () {
    return new Signal(emit => {
      emit.complete()
    })
  }

  /**
   * Returns a signal that never emits any values or completes.
   *
   * This method is not very useful on its own, but it can be used with other
   * combinators (e.g. `fold`, `scan`, etc).
   *
   * @returns {Signal} A new signal.
   */
  static never () {
    return new Signal(always)
  }

  /**
   * Returns a signal that emits a value `a`.
   *
   * The signal completes immediately after the value has been emited.
   *
   * @param a A value.
   * @returns {Signal} A new signal.
   */
  static of (a) {
    return new Signal(emit => {
      emit.value(a)
      emit.complete()
    })
  }

  /**
   * Returns a signal that sequentially emits the values from an array `as`.
   *
   * The signal completes immediately after the last value in the array has
   * been emitted.
   *
   * @param {Array} as An array of values.
   * @returns {Signal} A new signal.
   * @example
   *
   * Signal.fromArray([1, 2, 3])
   */
  static fromArray (as) {
    return new Signal(emit => {
      setTimeout(() => {
        as.map(apply(emit.value))
        emit.complete()
      }, 0)
    })
  }

  /**
   * Returns a signal that wraps a callback function.
   *
   * The executor function `f` is passed with a `callback` function when the
   * signal is mounted. The `callback` is a standard *error-first callback*,
   * which means that if the callback is called with a non-`null` first
   * argument, then the signal will emit an error. If the callback is called
   * with a `null` first argument, then the signal will emit the value passed
   * with the second argument to the callback.
   *
   * @param {Function} f The executor function. It is passed with a callback
   * function when the signal is mounted.
   * @returns {Signal} A new signal.
   * @example
   *
   * Signal.fromCallback(callback => {
   *   // Emit the value 'foo'
   *   callback(null, 'foo')
   *
   *   // Emit the error 'bar'
   *   callback('bar')
   * })
   */
  static fromCallback (f) {
    return new Signal(emit => {
      f((e, a) => {
        if (typeof e !== 'undefined' && e !== null) {
          emit.error(e)
        } else {
          emit.value(a)
        }
      })
    })
  }

  /**
   * Returns a signal that emits events of `type` from the
   * `EventTarget`-compatible `target` object.
   *
   * @param {String} type A string representing the event type to listen for.
   * @param {EventTarget} target The event target (e.g. a DOM element).
   * @param {Object} [options] An options object.
   * @param {Boolean} [options.useCapture=true] A boolean indicating that events of
   * this type will be dispatched to the signal before being dispatched to any
   * `EventTarget` beneath it in the DOM tree.
   * @returns {Signal} A new signal.
   * @example
   *
   * Signal.fromEvent('click', document)
   */
  static fromEvent (type, target, options) {
    options = options || { useCapture: true }

    return new Signal(emit => {
      if (target.addListener) {
        target.addListener(type, emit.value)
      } else if (target.addEventListener) {
        target.addEventListener(type, emit.value, useCapture)
      }

      return () => {
        if (target.addListener) {
          target.removeListener(type, emit.value)
        } else {
          target.removeEventListener('type', emit.value, useCapture)
        }
      }
    })
  }

  /**
   * Returns a signal that wraps a promise `p`. The signal completes
   * immediately after the promise is resolved.
   *
   * @param {Promise} p The promise to wrap.
   * @returns {Signal} A new signal.
   * @example
   *
   * const promise = new Promise((resolve, reject) => {
   *   ...
   * })
   *
   * const signal = Signal.fromPromise(promise)
   */
  static fromPromise (p) {
    return new Signal(emit => {
      p.then(emit.value, emit.error).finally(emit.complete)
    })
  }

  /**
   * Returns a signal that periodically emits a value every `n` milliseconds.
   *
   * @param {Number} n The number of milliseconds between each value.
   * @returns {Signal} A new signal.
   * @example
   *
   * // A signal that emits the value 'foo' every second.
   * Signal.periodic(1000).always('foo')
   */
  static periodic (n) {
    return new Signal(emit => {
      const id = setInterval(() => emit.value(), n)
      return () => clearInterval(id)
    })
  }

  /**
   * Returns a signal that sequentially emits the values from the array of `as`
   * every `n` milliseconds. The signal completes immediately after the last
   * value has been emitted.
   *
   * @param {Number} n The number of milliseconds between each clock tick.
   * @param {Array} as An array of values.
   * @returns {Signal} A new signal.
   * @example
   *
   * // A signal that emits a value every second, and then completes.
   * Signal.sequential(1000, [1, 2, 3])
   */
  static sequential (n, as) {
    return new Signal(emit => {
      const id = setInterval(() => {
        emit.value(head(as))

        as = tail(as)

        if (empty(as)) {
          clearInterval(id)
          emit.complete()
        }
      }, n)

      return () => clearInterval(id)
    })
  }

  /**
   * Replaces the signal values with a constant `c`.
   *
   * @param c The constant value.
   * @returns {Signal} A new signal.
   */
  always (c) {
    return new Signal(emit => {
      const value = () => emit.value(c)
      return this.subscribe({ ...emit, value })
    })
  }

  /**
   * Emits a value `a` before any other values are emitted by the signal.
   *
   * @param a The value to emit first.
   * @returns {Signal} A new signal.
   */
  startWith (a) {
    return new Signal(emit => {
      emit.value(a)
      return this.subscribe(emit)
    })
  }

  /**
   * Delays the values emitted by the signal by `n` milliseconds.
   *
   * @param {Number} n The number of milliseconds to delay.
   * @returns {Signal} A new signal.
   */
  delay (n) {
    return delay(n, this)
  }

  /**
   * Debounces the signal to only emit a value `n` milliseconds after the last
   * burst of events.
   *
   * @param {Number} n The number of milliseconds to delay.
   * @returns {Signal} A new signal.
   */
  debounce (n) {
    return debounce(n, this)
  }

  /**
   * Limits the rate at which values are emitted by the signal.
   *
   * @param {Number} n The number of milliseconds between emitted values.
   * @returns {Signal} A new signal.
   */
  throttle (n) {
    return throttle(n, this)
  }

  /**
   * Maps a function `f` over the signal. The function must also return a
   * `Signal`.
   *
   * @param {Function} f A function that returns a signal.
   * @returns {Signal} A new signal.
   */
  concatMap (f) {
    return concatMap(f, this)
  }

  /**
   * Maps a function `f` over the signal.
   *
   * @param {Function} f A function that returns a value.
   * @returns {Signal} A new signal.
   * @example
   *
   * // A signal that increments the values emitted by the given signal.
   * signal.map(a => a + 1)
   */
  map (f) {
    return map(f, this)
  }

  /**
   * Filters the signal using a predicate function `p`.
   *
   * @param {Function} p A predicate function that returns truthy of falsey for
   * a given signal value.
   * @returns {Signal} A new signal.
   * @example
   *
   * // A signal that only emits positive values emitted by the given signal.
   * signal.filter(a => a > 0)
   */
  filter (p) {
    return filter(p, this)
  }

  /**
   * Folds a function `f` over the signal. The folded value is emitted only
   * after the signal is complete.
   *
   * @param {Function} f A function.
   * @param a The starting value.
   * @returns {Signal} A new signal.
   * @example
   *
   * // A signal that emits the sum of the values emitted by the parent signal.
   * // The sum is emitted only after the parent signal is complete.
   * signal.fold((a, b) => a + b, 0)
   */
  fold (f, a) {
    return fold(f, a, this)
  }

  /**
   * Scans a function `f` over the signal. Unlike the `fold` function, the
   * signal values are emitted incrementally.
   *
   * @param {Function} f A function.
   * @param a The starting value.
   * @returns {Signal} A new signal.
   */
  scan (f, a) {
    return scan(f, a, this)
  }

  /**
   * Runs a state machine over the signal using a transform function `t`. The
   * transform function must return a new state, it can also optionally emit
   * values or errors using the `emit` object.
   *
   * @param {Function} f A transform function.
   * @param a The initial state.
   * @returns {Signal} A new signal.
   * @example
   *
   * // A signal that emits the inverse running total of the values emitted by
   * // the given signal.
   * signal.stateMachine((a, b, emit) => {
   *   emit.value(1 / (a + b))
   *   return a + b
   * }, 0)
   *
   */
  stateMachine (f, a) {
    return stateMachine(f, a, this)
  }

  /**
   * Merges the signal with other signals.
   *
   * The signal completes when *all* of the merged signals have completed.
   *
   * @param {Array} ss An array of signals.
   * @returns {Signal} A new signal.
   * @example
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = Signal.fromArray([4, 5, 6])
   *
   * // A signal that emits the values from the merged signals.
   * s.merge(t)
   */
  merge (...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return merge([this].concat(ss))
  }

  /**
   * Combines the corresponding values from the signal with other signals. The
   * resulting signal emits tuples of corresponding values.
   *
   * The signal completes when *any* of the zipped signals have completed.
   *
   * @param {Array} ss An array of signals.
   * @returns {Signal} A new signal.
   * @example
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = Signal.fromArray([4, 5, 6])
   *
   * // A signal that emits tuples of corresponding values.
   * s.zip(t)
   */
  zip (...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return zip([this].concat(ss))
  }

  /**
   * Generalises the `zip` function to combine corresponding values from one or
   * more signals using a function.
   *
   * The signal completes when *any* of the input signals have completed.
   *
   * @param {Function} f A function.
   * @param {Array} ss An array of signals.
   * @returns {Signal} A new signal.
   * @example
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = Signal.fromArray([4, 5, 6])
   *
   * // A signal that emits the sum of the corresponding values.
   * s.zipWith((a, b) => a + b, t)
   */
  zipWith (f, ...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return zipWith(f, [this].concat(ss))
  }

  /**
   * Emits the most recent value from the given signal `s` whenever there is an
   * event on the sampler signal.
   *
   * @param {Signal} s A signal.
   * @returns {Signal} A new signal.
   */
  sample (s) {
    return sample(this, s)
  }

  /**
   * Pauses emitting values from the given signal `s` if the most recent value
   * from the sampler signal is truthy. It will resume emitting events after
   * there is a falsey value.
   *
   * @param {Signal} s A signal.
   * @returns {Signal} A new signal.
   */
  hold (s) {
    return hold(this, s)
  }

  /**
   * Removes duplicate values from the signal.
   *
   * @returns {Signal} A new signal.
   */
  dedupe () {
    return dedupe(this)
  }

  /**
   * Removes duplicate values from the signal using a comparator function `f`.
   *
   * @param {Function} f A comparator function.
   * @returns {Signal} A new signal.
   */
  dedupeWith (f) {
    return dedupeWith(f, this)
  }

  /**
   * A higher-order signal function (operates on a signal that emits other
   * signals) that emits events from the most recent signal value.
   *
   * @returns {Signal} A new signal.
   */
  switchLatest () {
    return switchLatest(this)
  }

  /**
   * Switches between the array of signals `ss` based on the last signal value.
   * The values emitted by the signal represent the index of the signal to
   * switch to.
   *
   * @param {Array} ss An array of signals.
   * @returns {Signal} A new signal.
   */
  encode (...ss) {
    return encode(this, ss)
  }
}
