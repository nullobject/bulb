import { apply, empty, head, tail } from 'fkit'

import Subscription from './Subscription'
import concat from './combinators/concat'
import dedupe from './combinators/dedupe'
import encode from './combinators/encode'
import merge from './combinators/merge'
import switchLatest from './combinators/switchLatest'
import zip from './combinators/zip'
import zipWith from './combinators/zipWith'
import { always } from './combinators/always'
import { asap } from './scheduler'
import { concatMap } from './combinators/concatMap'
import { cycle } from './combinators/cycle'
import { debounce } from './combinators/debounce'
import { dedupeWith } from './combinators/dedupeWith'
import { delay } from './combinators/delay'
import { drop } from './combinators/drop'
import { dropWhile } from './combinators/dropWhile'
import { filter } from './combinators/filter'
import { fold } from './combinators/fold'
import { hold } from './combinators/hold'
import { map } from './combinators/map'
import { sample } from './combinators/sample'
import { scan } from './combinators/scan'
import { sequential } from './combinators/sequential'
import { stateMachine } from './combinators/stateMachine'
import { switchMap } from './combinators/switchMap'
import { take } from './combinators/take'
import { takeWhile } from './combinators/takeWhile'
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
 * const s = new Signal(emit => {
 *   // Start the timer and emit a value whenever the timer fires.
 *   const id = setInterval(() => emit.value('foo'), 1000)
 *
 *   // Return a function to be called when the signal is unmounted.
 *   return () => clearInterval(id)
 * })
 *
 * // Subscribe to the signal and log emitted values to the console.
 * const subscription = s.subscribe(console.log)
 *
 * // When we are done, we can unsubscribe from the signal.
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
   * Subscribes an observer to the signal.
   *
   * The `subscribe` method returns a subscription handle, which can be used to
   * unsubscribe from the signal.
   *
   * @param {Function} [value] The callback function called when the signal
   * emits a value.
   * @param {Function} [error] The callback function called when the signal
   * emits an error.
   * @param {Function} [complete] The callback function called when the signal
   * has completed.
   * @returns {Subscription} A subscription handle.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   *
   * // Subscribe to the signal and log emitted values to the console.
   * const subscription = s.subscribe(console.log)
   *
   * // When we are done, we can unsubscribe from the signal.
   * subscription.unsubscribe()
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
    const handleValue = emitter(this._subscriptions, 'value')
    const handleError = emitter(this._subscriptions, 'error')
    const handleComplete = () => {
      // Notify the subscribers that the signal has completed and call the
      // unmount function.
      emitter(this._subscriptions, 'complete')()
      this.unmount()
    }

    // Add the subscription.
    this._subscriptions.add(subscription)

    // Call the mount function if we're adding the first subscription.
    if (this._subscriptions.size === 1) {
      this.mount({ value: handleValue, error: handleError, complete: handleComplete })
    }

    return subscription
  }

  /**
   * Creates a signal that never emits any values and has already completed.
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
   * Creates a signal that never emits any values or completes.
   *
   * This method is not very useful on its own, but it can be used with other
   * combinators (e.g. `fold`, `scan`, etc).
   *
   * @returns {Signal} A new signal.
   */
  static never () {
    return new Signal(() => {})
  }

  /**
   * Creates a signal that emits a value `a`. The returned signal will complete
   * immediately after the value has been emited.
   *
   * @param a The value to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1)
   *
   * s.subscribe(console.log) // 1
   */
  static of (a) {
    return new Signal(emit => {
      asap(() => {
        emit.value(a)
        emit.complete()
      })
    })
  }

  /**
   * Creates a signal that sequentially emits the values from an array `as`.
   * The returned signal will complete immediately after the last value in the
   * array has been emitted.
   *
   * @param {Array} as The values to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   *
   * s.subscribe(console.log) // 1, 2, 3
   */
  static fromArray (as) {
    return new Signal(emit => {
      asap(() => {
        as.map(apply(emit.value))
        emit.complete()
      })
    })
  }

  /**
   * Creates a signal that wraps a callback.
   *
   * The executor function `f` is passed with a `callback` function when the
   * signal is mounted. The `callback` is a standard *error-first callback*,
   * which means that if the callback is called with a non-`null` first
   * argument, then the returned signal will emit an error. If the callback is
   * called with a `null` first argument, then the returned signal will emit a
   * value.
   *
   * @param {Function} f The executor function to be passed with a callback
   * function when the signal is mounted.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromCallback(callback => {
   *   callback(null, 'foo')
   * })
   *
   * s.subscribe(console.log) // 'foo'
   */
  static fromCallback (f) {
    return new Signal(emit => {
      f((e, a) => {
        if (e !== 'undefined' && e !== null) {
          emit.error(e)
        } else {
          emit.value(a)
        }
      })
    })
  }

  /**
   * Creates a signal that emits events of `type` from the
   * `EventTarget`-compatible `target` object.
   *
   * @param {String} type The event type to listen for.
   * @param {EventTarget} target The event target (e.g. a DOM element).
   * @param {Object} [options] The options.
   * @param {Boolean} [options.useCapture=true] A boolean indicating that
   * events of this type will be dispatched to the signal before being
   * dispatched to any `EventTarget` beneath it in the DOM tree.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * Signal.fromEvent('click', document)
   */
  static fromEvent (type, target, options) {
    options = options || { useCapture: true }

    return new Signal(emit => {
      if (target.addListener) {
        target.addListener(type, emit.value)
      } else if (target.addEventListener) {
        target.addEventListener(type, emit.value, options.useCapture)
      }

      return () => {
        if (target.addListener) {
          target.removeListener(type, emit.value)
        } else {
          target.removeEventListener('type', emit.value, options.useCapture)
        }
      }
    })
  }

  /**
   * Creates a signal that wraps a promise `p`. The returned signal will
   * complete immediately after the promise is resolved.
   *
   * @param {Promise} p The promise to wrap.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const p = new Promise((resolve, reject) => {
   *   resolve('foo')
   * })
   * const s = Signal.fromPromise(p)
   *
   * s.subscribe(console.log) // 'foo'
   */
  static fromPromise (p) {
    return new Signal(emit => {
      p.then(emit.value, emit.error).finally(emit.complete)
    })
  }

  /**
   * Creates a signal that periodically emits a value every `n` milliseconds.
   *
   * @param {Number} n The number of milliseconds to wait between emitting each
   * value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.periodic(1000)
   * const t = s.always(1)
   *
   * t.subscribe(console.log) // 1, 1, ...
   */
  static periodic (n) {
    return new Signal(emit => {
      const id = setInterval(() => emit.value(), n)
      return () => clearInterval(id)
    })
  }

  /**
   * Creates a signal that sequentially emits the next value from an array `as`
   * every `n` milliseconds. The returned signal will complete immediately
   * after the last value has been emitted.
   *
   * @deprecated
   * @param {Number} n The number of milliseconds to wait between emitting each
   * value.
   * @param {Array} as The values to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.sequential(1000, [1, 2, 3])
   *
   * s.subscribe(console.log) // 1, 2, 3
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
   * Replaces the values of the signal with a constant `c`.
   *
   * @param c The constant value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray[1, 2, 3]
   * const t = s.always(1)
   *
   * t.subscribe(console.log) // 1, 1, 1
   */
  always (c) {
    return always(c, this)
  }

  /**
   * Emits a value `a` before any other values are emitted by the signal.
   *
   * @param a The value to emit first.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray[1, 2, 3]
   * const t = s.startWith(0)
   *
   * t.subscribe(console.log) // 0, 1, 2, 3
   */
  startWith (a) {
    return new Signal(emit => {
      asap(() => { emit.value(a) })
      return this.subscribe(emit)
    })
  }

  /**
   * Cycles through the values of an array `as` for every value emitted by the
   * signal.
   *
   * @param {Array} as The values to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.periodic(1000)
   * const t = s.cycle([1, 2, 3])
   *
   * t.subscribe(console.log) // 1, 2, 3, 1, 2, 3, ...
   */
  cycle (as) {
    return cycle(as, this)
  }

  /**
   * Emits the next value from an array `as` for every value emitted by the
   * signal. The returned signal will complete immediately after the last value
   * has been emitted.
   *
   * @param {Array} as The values to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.periodic(1000)
   * const t = s.sequential([1, 2, 3])
   *
   * t.subscribe(console.log) // 1, 2, 3
   */
  sequential (as) {
    return sequential(as, this)
  }

  /**
   * Delays each value emitted by the signal for `n` milliseconds.
   *
   * @param {Number} n The number of milliseconds to delay.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { mousePosition } from 'bulb'
   *
   * const s = mousePosition(document)
   * const t = s.delay(1000)
   *
   * t.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  delay (n) {
    return delay(n, this)
  }

  /**
   * Waits until `n` milliseconds after the last burst of values before
   * emitting the most recent value from the signal.
   *
   * @param {Number} n The number of milliseconds to wait.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { mousePosition } from 'bulb'
   *
   * const s = mousePosition(document)
   * const t = s.debounce(1000)
   *
   * t.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  debounce (n) {
    return debounce(n, this)
  }

  /**
   * Limits the rate at which values are emitted by the signal. Values are
   * dropped when the rate limit is exceeded.
   *
   * @param {Number} n The number of milliseconds to wait between emitted
   * values.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { mousePosition } from 'bulb'
   *
   * const s = mousePosition(document)
   * const t = s.throttle(1000)
   *
   * t.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  throttle (n) {
    return throttle(n, this)
  }

  /**
   * Concatenates the signals `ss` and emits their values. The returned signal
   * will join the given signals, waiting for each one to complete before joining
   * the next, and will complete once *all* of the given signals have completed.
   *
   * @param {Array} ss The signals to concatenate.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = Signal.fromArray([4, 5, 6])
   * const u = s.concat(t)
   *
   * u.subscribe(console.log) // 1, 2, 3, 4, 5, 6
   */
  concat (...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return concat([this].concat(ss))
  }

  /**
   * Applies a function `f`, which returns a `Signal`, to each value emitted by
   * the signal. The returned signal will join all signals returned by the
   * function, waiting for each one to complete before merging the next.
   *
   * @param {Function} f The function to apply to each value emitted by the
   * signal. It must also return a `Signal`.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.concatMap(a => Signal.of(a + 1))
   *
   * t.subscribe(console.log) // 2, 3, 4
   */
  concatMap (f) {
    return concatMap(f, this)
  }

  /**
   * Applies a function `f` to each value emitted by the signal.
   *
   * @param {Function} f The function to apply to each value emitted by the
   * signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.map(a => a + 1)
   *
   * t.subscribe(console.log) // 2, 3, 4
   */
  map (f) {
    return map(f, this)
  }

  /**
   * Filters the signal by only emitting values that satisfy a predicate
   * function `p`.
   *
   * @param {Function} p The predicate function to apply to each value emitted
   * by the signal. If it returns `true`, the value will be emitted, otherwise
   * the value will not be emitted.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.filter(a => a > 1)
   *
   * t.subscribe(console.log) // 2, 3
   */
  filter (p) {
    return filter(p, this)
  }

  /**
   * Applies an accumulator function `f` to each value emitted by the signal.
   * The accumulated value will be emitted when the signal has completed.
   *
   * @param {Function} f The accumulator function to apply to each value
   * emitted by the signal.
   * @param a The starting value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.fold((a, b) => a + b, 0)
   *
   * t.subscribe(console.log) // 6
   */
  fold (f, a) {
    return fold(f, a, this)
  }

  /**
   * Applies an accumulator function `f` to each value emitted by the signal.
   * The accumulated value will be emitted for each value emitted by the
   * signal.
   *
   * @param {Function} f The accumulator function to apply to each value
   * emitted by the signal.
   * @param a The starting value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.scan((a, b) => a + b, 0)
   *
   * t.subscribe(console.log) // 1, 3, 6
   */
  scan (f, a) {
    return scan(f, a, this)
  }

  /**
   * Applies a transform function `f` to each value emitted by the signal.
   *
   * The transform function must return a new state, it can also optionally
   * emit values or errors using the `emit` object.
   *
   * @param {Function} f The transform function to apply to each value emitted
   * by the signal.
   * @param a The initial state.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.stateMachine((a, b, emit) => {
   *   emit.value(a + b)
   *   return a * b
   * }, 1)
   *
   * t.subscribe(console.log) // 1, 3, 5
   */
  stateMachine (f, a) {
    return stateMachine(f, a, this)
  }

  /**
   * Merges the signals `ss` and emits their values. The returned signal will
   * complete once *all* of the given signals have completed.
   *
   * @param {Array} ss The signals to merge.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = Signal.fromArray([4, 5, 6])
   * const u = s.merge(t)
   *
   * u.subscribe(console.log) // 1, 4, 2, 5, 3, 6
   */
  merge (...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return merge([this].concat(ss))
  }

  /**
   * Combines the corresponding values emitted by the signals `ss` into tuples.
   * The returned signal will complete when *any* of the given signals have
   * completed.
   *
   * @param {Array} ss The signals to zip.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = Signal.fromArray([4, 5, 6])
   * const u = s.zip(t)
   *
   * u.subscribe(console.log) // [1, 4], [2, 5], [3, 6]
   */
  zip (...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return zip([this].concat(ss))
  }

  /**
   * Applies the function `f` to the corresponding values emitted by the
   * signals `ss`. The returned signal will complete when *any* of the given
   * signals have completed.
   *
   * @param {Function} f The function to apply to the corresponding values
   * emitted by the signals.
   * @param {Array} ss The signals to zip.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = Signal.fromArray([4, 5, 6])
   * const u = s.zipWith((a, b) => a + b, t)
   *
   * u.subscribe(console.log) // 5, 7, 9
   */
  zipWith (f, ...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return zipWith(f, [this].concat(ss))
  }

  /**
   * Takes the first `n` values emitted by the signal, and then completes.
   *
   * @param {Number} n The number of values to take.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.take(2)
   *
   * t.subscribe(console.log) // 1, 2
   */
  take (n) {
    return take(n, this)
  }

  /**
   * Emits values from the signal while the predicate function `p` is
   * satisfied. The returned signal will complete once the predicate function
   * is not satisfied.
   *
   * @param {Function} p The predicate function to apply to each value emitted
   * by the signal. If it returns `true`, the value will be emitted, otherwise
   * the value will not be emitted.
   * @returns {Signal} A new signal.
   * @example
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.takeWhile(a => a < 2)
   *
   * t.subscribe(console.log) // 1
   */
  takeWhile (p) {
    return takeWhile(p, this)
  }

  /**
   * Drops the first `n` values emitted by the signal.
   *
   * @param {Number} n The number of values to drop.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.drop(2)
   *
   * t.subscribe(console.log) // 3
   */
  drop (n) {
    return drop(n, this)
  }

  /**
   * Ignores values emitted by the signal while the predicate function `p` is
   * satisfied. The returned signal will emit values once the predicate
   * function is not satisfied.
   *
   * @param {Function} p The predicate function to apply to each value emitted
   * by the signal. If it returns `true`, the value will not be emitted,
   * otherwise the value will be emitted.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.dropWhile(a => a < 2)
   *
   * t.subscribe(console.log) // 2, 3
   */
  dropWhile (p) {
    return dropWhile(p, this)
  }

  /**
   * Emits the most recent value from the target signal `t` when there is an
   * event on the control signal.
   *
   * @param {Signal} t The target signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal, mousePosition } from 'bulb'
   *
   * const s = Signal.periodic(1000)
   * const t = mousePosition()
   * const u = s.sample(t)
   *
   * u.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  sample (t) {
    return sample(this, t)
  }

  /**
   * Pauses emitting events from target signal `t` when the most recent value
   * from the signal is truthy.
   *
   * @param {Signal} t The target signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { mouseButton, mousePosition } from 'bulb'
   *
   * const s = mouseButton(document)
   * const t = mousePosition(document)
   * const u = s.hold(t)
   *
   * u.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  hold (t) {
    return hold(this, t)
  }

  /**
   * Removes duplicate values emitted by the signal.
   *
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 2, 3, 3, 3])
   * const t = s.dedupe()
   *
   * t.subscribe(console.log) // 1, 2, 3
   */
  dedupe () {
    return dedupe(this)
  }

  /**
   * Removes duplicate values emitted by the signal using a comparator function
   * `f`.
   *
   * @param {Function} f The comparator function to apply to successive values
   * emitted by the signal. If the value is distinct from the previous value,
   * then the comparator function should return `true`, otherwise it should
   * return `false`.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 2, 3, 3, 3])
   * const t = s.dedupeWith((a, b) => a === b)
   *
   * t.subscribe(console.log) // 1, 2, 3
   */
  dedupeWith (f) {
    return dedupeWith(f, this)
  }

  /**
   * Subscribes to the most recent signal emitted by the signal (a signal that
   * emits other signals). The returned signal will emit values from the most
   * recent signal.
   *
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1)
   * const t = Signal.of(2)
   * const u = Signal.periodic(1000).sequential([s, t])
   * const v = u.switchLatest()
   *
   * v.subscribe(console.log) // 1, 2
   */
  switchLatest () {
    return switchLatest(this)
  }

  /**
   * Applies a function `f`, which returns a `Signal`, to each value emitted by
   * the signal. The returned signal will emit values from the most recent
   * signal returned by the function.
   *
   * @param {Function} f The function to apply to each value emitted by the
   * signal. It must also return a `Signal`.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.fromArray([1, 2, 3])
   * const t = s.switchMap(a => Signal.of(a + 1))
   *
   * t.subscribe(console.log) // 2, 3, 4
   */
  switchMap (f) {
    return switchMap(f, this)
  }

  /**
   * Switches between the target signals `ts` based on the most recent value
   * emitted by the signal. The values emitted by the control signal represent
   * the index of the target signal to switch to.
   *
   * @param {Array} ts The target signals.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1)
   * const t = Signal.of(2)
   * const u = Signal.periodic(1000).sequential([1, 2])
   *
   * u.encode(s, t).subscribe(console.log) // 1, 2
   */
  encode (...ts) {
    return encode(this, ts)
  }
}
