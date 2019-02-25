import Subscription from './Subscription'
import all from './combinators/all'
import always from './combinators/always'
import any from './combinators/any'
import apply from './combinators/apply'
import buffer from './combinators/buffer'
import catchError from './combinators/catchError'
import concat from './combinators/concat'
import concatMap from './combinators/concatMap'
import cycle from './combinators/cycle'
import debounce from './combinators/debounce'
import dedupeWith from './combinators/dedupeWith'
import delay from './combinators/delay'
import drop from './combinators/drop'
import dropUntil from './combinators/dropUntil'
import dropWhile from './combinators/dropWhile'
import eq from './internal/eq'
import filter from './combinators/filter'
import fold from './combinators/fold'
import hold from './combinators/hold'
import id from './internal/id'
import map from './combinators/map'
import merge from './combinators/merge'
import sample from './combinators/sample'
import scan from './combinators/scan'
import sequential from './combinators/sequential'
import stateMachine from './combinators/stateMachine'
import switchMap from './combinators/switchMap'
import take from './combinators/take'
import takeUntil from './combinators/takeUntil'
import takeWhile from './combinators/takeWhile'
import throttle from './combinators/throttle'
import tuple from './internal/tuple'
import zipWith from './combinators/zipWith'
import { asap } from './scheduler'

/**
 * Creates a callback function that emits values to a list of subscribers.
 *
 * @private
 * @param {Array} subscriptions An array of subscriptions.
 * @param {String} type The type of callback to create.
 * @returns {Function} A function that emits a value to all of the subscriptions.
 */
function broadcast (subscriptions, type) {
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
 * * `emit.next(a)` - Emits the value `a`.
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
 * import { Signal } from 'bulb'
 *
 * // Create a signal that emits the value 'foo' every second.
 * const s = new Signal(emit => {
 *   // Start the timer and emit a value whenever the timer fires.
 *   const id = setInterval(() => emit.next('foo'), 1000)
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
  tryMount (emit) {
    this._unmount = this._mount(emit)
  }

  /**
   * Unmounts the signal.
   *
   * @private
   */
  tryUnmount () {
    if (typeof this._unmount === 'function') {
      this._unmount()
    }

    this._unmount = null
  }

  /**
   * Concatenates the given signals and emits their values. The returned signal
   * will join the signals, waiting for each one to complete before joining the
   * next, and will complete once *all* of the signals have completed.
   *
   * @param {...Signal} signals The signals to concatenate.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = Signal.concat(s, t)
   *
   * u.subscribe(console.log) // 1, 2, 3, 4, 5, 6
   */
  static concat (...signals) {
    return concat(signals)
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
      asap(() => emit.complete())
    })
  }

  /**
   * Creates a signal that immediately emits the values from an `iterable`.
   * The returned signal will complete after the last value in the iterable has
   * been emitted.
   *
   * @param iterable The iterable that contains the values to be emitted.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.from([1, 2, 3])
   *
   * s.subscribe(console.log) // 1, 2, 3
   */
  static from (iterable) {
    return new Signal(emit => {
      asap(() => {
        for (let a of iterable) {
          emit.next(a)
        }
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
          emit.next(a)
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
        target.addListener(type, emit.next)
      } else if (target.addEventListener) {
        target.addEventListener(type, emit.next, options.useCapture)
      }

      return () => {
        if (target.addListener) {
          target.removeListener(type, emit.next)
        } else {
          target.removeEventListener('type', emit.next, options.useCapture)
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
      p.then(emit.next, emit.error).finally(emit.complete)
    })
  }

  /**
   * Merges the given signals and emits their values. The returned signal will
   * complete once *all* of the signals have completed.
   *
   * @param {...Signal} signals The signals to merge.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = Signal.merge(s, t)
   *
   * u.subscribe(console.log) // 1, 4, 2, 5, 3, 6
   */
  static merge (...signals) {
    return merge(signals)
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
   * Creates a signal that immediately emits the `values`. The returned signal
   * will complete immediately after the values have been emited.
   *
   * @param values The values to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   *
   * s.subscribe(console.log) // 1, 2, 3
   */
  static of (...values) {
    return new Signal(emit => {
      asap(() => {
        values.map(a => emit.next(a))
        emit.complete()
      })
    })
  }

  /**
   * Creates a signal that emits a value every `n` milliseconds. The value
   * emitted starts at zero and increments indefinitely.
   *
   * @param {Number} n The number of milliseconds to wait between each value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.periodic(1000)
   *
   * s.subscribe(console.log) // 0, 1, 2, ...
   */
  static periodic (n) {
    return new Signal(emit => {
      let count = 0
      const id = setInterval(() => emit.next(count++), n)
      return () => clearInterval(id)
    })
  }

  /**
   * Creates a signal that emits an error. The returned signal will complete
   * immediately after the error has been emited.
   *
   * @param e The error to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.error('foo')
   *
   * s.subscribe({ error: console.error }) // 'foo'
   */
  static throwError (e) {
    return new Signal(emit => {
      asap(() => {
        emit.error(e)
        emit.complete()
      })
    })
  }

  /**
   * Combines the corresponding values emitted by the given signals into
   * tuples. The returned signal will complete when *any* of the signals have
   * completed.
   *
   * @param {...Signal} signals The signals to zip.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = Signal.zip(s, t)
   *
   * u.subscribe(console.log) // [1, 4], [2, 5], [3, 6]
   */
  static zip (...signals) {
    return zipWith(tuple, signals)
  }

  /**
   * Applies the function `f` to the corresponding values emitted by the given
   * signals. The returned signal will complete when *any* of the signals have
   * completed.
   *
   * @param {Function} f The function to apply to the corresponding values
   * emitted by the signals.
   * @param {...Signal} signals The signals to zip.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = Signal.zipWith((a, b) => a + b, s, t)
   *
   * u.subscribe(console.log) // 5, 7, 9
   */
  static zipWith (f, ...signals) {
    return zipWith(f, signals)
  }

  /**
   * Emits `true` if *all* the values emitted by the signal satisfy a predicate
   * function `p`. The returned signal will complete if the signal emits *any*
   * value that doesn't satisfy the predictate function.
   *
   * @param {Function} p The predicate function to apply to each value emitted
   * by the signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .all(a => a > 0)
   *
   * s.subscribe(console.log) // true
   */
  all (p) {
    return new Signal(all(p, this))
  }

  /**
   * Replaces the values of the signal with a constant value
   *
   * @param value The constant value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .periodic(1000)
   *   .always(1)
   *
   * s.subscribe(console.log) // 1, 1, 1, ...
   */
  always (value) {
    return new Signal(always(value, this))
  }

  /**
   * Emits `true` if *any* of the values emitted by the signal satisfy a
   * predicate function `p`. The returned signal will complete if the signal
   * emits *any* value that satisfies the predictate function.
   *
   * @param {Function} p The predicate function to apply to each value emitted
   * by the signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .any(a => a < 0)
   *
   * s.subscribe(console.log) // false
   */
  any (p) {
    return new Signal(any(p, this))
  }

  /**
   * Emits the given values after the signal has completed.
   *
   * @param values The values to append.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .append(4, 5, 6)
   *
   * s.subscribe(console.log) // 1, 2, 3, 4, 5, 6
   */
  append (...values) {
    return new Signal(concat([this, Signal.from(values)]))
  }

  /**
   * Applies the latest function emitted by the signal to latest values emitted
   * by the given signals. The returned signal will complete when *any* of the
   * signals have completed.
   *
   * The latest function will be called with a number of arguments equal to the
   * number of signals. For example, if the latest function is `(a, b) => a + b`,
   * then you will need to supply two signals.
   *
   * @param {...Signal} signals The value signals.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = Signal
   *   .of((a, b) => a + b)
   *   .apply(s, t)
   *
   * u.subscribe(console.log) // 5, 7, 9
   */
  apply (...signals) {
    return new Signal(apply(this, signals))
  }

  /**
   * Buffers values emitted by the signal and emits the buffer contents when it
   * is full. The buffer contents will be emitted when the signal completes,
   * regardless of whether the buffer is full.
   *
   * @param {Number} [n=Infinity] The size of the buffer. If the size is set to
   * `Infinity`, then the signal will be buffered until it completes.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3, 4)
   *   .buffer(2)
   *
   * s.subscribe(console.log) // [1, 2], [2, 4], ...
   */
  buffer (n = Infinity) {
    return new Signal(buffer(n, this))
  }

  /**
   * Applies a function `f`, that returns a `Signal`, to the first error
   * emitted by the signal. The returned signal will emit values from the
   * signal returned by the function.
   *
   * @param {Function} f The function to apply to an error emitted by the
   * signal. It must also return a `Signal`.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .throwError()
   *   .catchError(e => Signal.of(1))
   *
   * s.subscribe(console.log) // 1
   */
  catchError (f) {
    return new Signal(catchError(f, this))
  }

  /**
   * Concatenates the given signals and emits their values. The returned signal
   * will join the signals, waiting for each one to complete before joining the
   * next, and will complete once *all* of the signals have completed.
   *
   * @param {...Signal} signals The signals to concatenate.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = s.concat(t)
   *
   * u.subscribe(console.log) // 1, 2, 3, 4, 5, 6
   */
  concat (...signals) {
    return new Signal(concat([this].concat(signals)))
  }

  /**
   * Applies a function `f`, that returns a `Signal`, to each value emitted by
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
   * const s = Signal
   *   .of(1, 2, 3)
   *   .concatMap(a => Signal.of(a + 1))
   *
   * s.subscribe(console.log) // 2, 3, 4
   */
  concatMap (f) {
    return new Signal(concatMap(f, this))
  }

  /**
   * Cycles through the given values as values are emitted by the signal.
   *
   * @param values The values to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .periodic(1000)
   *   .cycle(1, 2, 3)
   *
   * s.subscribe(console.log) // 1, 2, 3, 1, 2, 3, ...
   */
  cycle (...values) {
    return new Signal(cycle(values, this))
  }

  /**
   * Waits until `n` milliseconds after the last burst of values before
   * emitting the most recent value from the signal.
   *
   * @param {Number} n The number of milliseconds to wait between each burst of
   * values.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Mouse } from 'bulb-input'
   *
   * const s = Mouse
   *   .position(document)
   *   .debounce(1000)
   *
   * s.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  debounce (n) {
    return new Signal(debounce(n, this))
  }

  /**
   * Removes duplicate values emitted by the signal.
   *
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 2, 3, 3, 3)
   *   .dedupe()
   *
   * s.subscribe(console.log) // 1, 2, 3
   */
  dedupe () {
    return new Signal(dedupeWith(eq, this))
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
   * const s = Signal
   *   .of(1, 2, 2, 3, 3, 3)
   *   .dedupeWith((a, b) => a === b)
   *
   * s.subscribe(console.log) // 1, 2, 3
   */
  dedupeWith (f) {
    return new Signal(dedupeWith(f, this))
  }

  /**
   * Delays each value emitted by the signal for `n` milliseconds.
   *
   * @param {Number} n The number of milliseconds to delay.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Mouse } from 'bulb-input'
   *
   * const s = Mouse
   *   .position(document)
   *   .delay(1000)
   *
   * s.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  delay (n) {
    return new Signal(delay(n, this))
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
   * const s = Signal
   *   .of(1, 2, 3)
   *   .drop(2)
   *
   * s.subscribe(console.log) // 3
   */
  drop (n) {
    return new Signal(drop(n, this))
  }

  /**
   * Drops values emitted by the signal until the given control signal emits a
   * value.
   *
   * @param {Signal} signal The control signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * const s = Signal.periodic(1000)
   * const t = Signal.of().delay(1000)
   * const u = s.dropUntil(t)
   *
   * u.subscribe(console.log) // 1, 2
   */
  dropUntil (signal) {
    return new Signal(dropUntil(signal, this))
  }

  /**
   * Drops values emitted by the signal while the predicate function `p` is
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
   * const s = Signal
   *   .of(1, 2, 3)
   *   .dropWhile(a => a < 2)
   *
   * s.subscribe(console.log) // 2, 3
   */
  dropWhile (p) {
    return new Signal(dropWhile(p, this))
  }

  /**
   * Switches between the given signals based on the most recent value emitted
   * by the signal. The values emitted by the signal represent the index of the
   * signal to switch to.
   *
   * @param {...Signal} signals The signals to encode.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1)
   * const t = Signal.of(2)
   * const u = Signal
   *   .periodic(1000)
   *   .sequential(0, 1)
   *   .encode(s, t)
   *
   * u.subscribe(console.log) // 1, 2
   */
  encode (...signals) {
    const s = new Signal(map(a => signals[a], this))
    return new Signal(switchMap(id, s))
  }

  /**
   * Emits a value when the signal has completed.
   *
   * @param value The value to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .endWith(4)
   *
   * s.subscribe(console.log) // 1, 2, 3, 4
   */
  endWith (value) {
    return new Signal(concat([this, Signal.of(value)]))
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
   * const s = Signal
   *   .of(1, 2, 3)
   *   .filter(a => a > 1)
   *
   * s.subscribe(console.log) // 2, 3
   */
  filter (p) {
    return new Signal(filter(p, this))
  }

  /**
   * Emits the first value from the signal, and then completes.
   *
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .first()
   *
   * s.subscribe(console.log) // 1
   */
  first () {
    return new Signal(take(1, this))
  }

  /**
   * Applies an accumulator function `f` to each value emitted by the signal.
   * The accumulated value will be emitted when the signal has completed.
   *
   * @param {Function} f The accumulator function to apply to each value
   * emitted by the signal.
   * @param initialValue The initial value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .fold((a, b) => a + b, 0)
   *
   * s.subscribe(console.log) // 6
   */
  fold (f, initialValue) {
    return new Signal(fold(f, initialValue, this))
  }

  /**
   * Stops emitting values from the signal while the given control signal is
   * truthy.
   *
   * @param {Signal} signal The control signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Mouse } from 'bulb-input'
   *
   * const s = Mouse.position(document)
   * const t = Mouse.button(document)
   * const u = s.hold(t)
   *
   * u.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  hold (signal) {
    return new Signal(hold(signal, this))
  }

  /**
   * Emits the last value from the signal, and then completes.
   *
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .last()
   *
   * s.subscribe(console.log) // 3
   */
  last () {
    return new Signal(fold((a, b) => b, null, this))
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
   * const s = Signal
   *   .of(1, 2, 3)
   *   .map(a => a + 1)
   *
   * s.subscribe(console.log) // 2, 3, 4
   */
  map (f) {
    return new Signal(map(f, this))
  }

  /**
   * Merges the given signals and emits their values. The returned signal will
   * complete once *all* of the signals have completed.
   *
   * @param {...Signal} signals The signals to merge.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = s.merge(t)
   *
   * u.subscribe(console.log) // 1, 4, 2, 5, 3, 6
   */
  merge (...signals) {
    return new Signal(merge([this].concat(signals)))
  }

  /**
   * Emits the given values before any other values are emitted by the signal.
   *
   * @param values The values to prepend.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .prepend(4, 5, 6)
   *
   * s.subscribe(console.log) // 4, 5, 6, 1, 2, 3
   */
  prepend (...values) {
    return new Signal(concat([Signal.from(values), this]))
  }

  /**
   * Emits the most recent value from the signal whenever there is an event on
   * the given control signal.
   *
   * @param {Signal} signal The control signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Mouse } from 'bulb-input'
   * import { Signal } from 'bulb'
   *
   * const s = Mouse.position(document)
   * const t = Signal.periodic(1000)
   * const u = s.sample(t)
   *
   * u.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  sample (signal) {
    return new Signal(sample(signal, this))
  }

  /**
   * Applies an accumulator function `f` to each value emitted by the signal.
   * The accumulated value will be emitted for each value emitted by the
   * signal.
   *
   * @param {Function} f The accumulator function to apply to each value
   * emitted by the signal.
   * @param initialValue The initial value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .scan((a, b) => a + b, 0)
   *
   * s.subscribe(console.log) // 1, 3, 6
   */
  scan (f, initialValue) {
    return new Signal(scan(f, initialValue, this))
  }

  /**
   * Emits the next value from the given values for every value emitted by the
   * signal. The returned signal will complete immediately after the last value
   * has been emitted.
   *
   * @param values The values to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .periodic(1000)
   *   .sequential(1, 2, 3)
   *
   * s.subscribe(console.log) // 1, 2, 3
   */
  sequential (...values) {
    return new Signal(sequential(values, this))
  }

  /**
   * Emits a value before any other values are emitted by the signal.
   *
   * @param value The value to emit.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .startWith(0)
   *
   * s.subscribe(console.log) // 0, 1, 2, 3
   */
  startWith (value) {
    return new Signal(concat([Signal.of(value), this]))
  }

  /**
   * Applies a transform function `f` to each value emitted by the signal.
   *
   * The transform function must return a new state, it can also optionally
   * emit values or errors using the `emit` object.
   *
   * @param {Function} f The transform function to apply to each value emitted
   * by the signal.
   * @param initialState The initial state.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal
   *   .of(1, 2, 3)
   *   .stateMachine((a, b, emit) => {
   *     emit.next(a + b)
   *     return a * b
   *   }, 1)
   *
   * s.subscribe(console.log) // 1, 3, 5
   */
  stateMachine (f, initialState) {
    return new Signal(stateMachine(f, initialState, this))
  }

  /**
   * Subscribes an observer to the signal.
   *
   * The `subscribe` method returns a subscription handle, which can be used to
   * unsubscribe from the signal.
   *
   * @param {Function} [onNext] The callback function called when the signal
   * emits a value.
   * @param {Function} [onError] The callback function called when the signal
   * emits an error.
   * @param {Function} [onComplete] The callback function called when the
   * signal has completed.
   * @returns {Subscription} A subscription handle.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   *
   * // Subscribe to the signal and log emitted values to the console.
   * const subscription = s.subscribe(console.log)
   *
   * // When we are done, we can unsubscribe from the signal.
   * subscription.unsubscribe()
   */
  subscribe (onNext, onError, onComplete) {
    let emit = {}

    if (typeof onNext === 'function') {
      emit = { next: onNext, error: onError, complete: onComplete }
    } else if (typeof onNext === 'object') {
      emit = onNext
    }

    // Create a new subscription to the signal.
    const subscription = new Subscription(emit, () => {
      // Mark the subsciption as closed.
      subscription.closed = true

      // Remove the subscription.
      this._subscriptions.delete(subscription)

      // Call the unmount function if we're removing the last subscription.
      if (this._subscriptions.size === 0) {
        this.tryUnmount()
      }
    })

    // Add the subscription.
    this._subscriptions.add(subscription)

    // Notifies the observers that a value was emitted.
    const next = broadcast(this._subscriptions, 'next')

    // Notifies the observers that an error was emitted.
    const error = broadcast(this._subscriptions, 'error')

    // Notifies the observers that the signal has completed and calls the
    // unmount function.
    const complete = () => {
      broadcast(this._subscriptions, 'complete')()
      this.tryUnmount()
    }

    // Call the mount function if we're adding the first subscription.
    if (this._subscriptions.size === 1) {
      this.tryMount({ next, error, complete })
    }

    return subscription
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
   * const u = Signal
   *   .periodic(1000)
   *   .sequential(s, t)
   *   .switchLatest()
   *
   * u.subscribe(console.log) // 1, 2
   */
  switchLatest () {
    return new Signal(switchMap(id, this))
  }

  /**
   * Applies a function `f`, that returns a `Signal`, to each value emitted by
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
   * const s = Signal
   *   .of(1, 2, 3)
   *   .switchMap(a => Signal.of(a + 1))
   *
   * s.subscribe(console.log) // 2, 3, 4
   */
  switchMap (f) {
    return new Signal(switchMap(f, this))
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
   * const s = Signal
   *   .of(1, 2, 3)
   *   .take(2)
   *
   * s.subscribe(console.log) // 1, 2
   */
  take (n) {
    return new Signal(take(n, this))
  }

  /**
   * Emits values from the signal until the given control signal emits a value.
   * The returned signal will complete once the control signal emits a value.
   *
   * @param {Signal} signal The control signal.
   * @returns {Signal} A new signal.
   * @example
   *
   * const s = Signal.periodic(1000)
   * const t = Signal.of().delay(1000)
   * const u = s.takeUntil(t)
   *
   * u.subscribe(console.log) // 0
   */
  takeUntil (signal) {
    return new Signal(takeUntil(signal, this))
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
   * const s = Signal
   *   .of(1, 2, 3)
   *   .takeWhile(a => a < 2)
   *
   * s.subscribe(console.log) // 1
   */
  takeWhile (p) {
    return new Signal(takeWhile(p, this))
  }

  /**
   * Limits the rate at which values are emitted by the signal to one every `n`
   * milliseconds. Values will be dropped when the rate limit is exceeded.
   *
   * @param {Number} n The number of milliseconds to wait between each value.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Mouse } from 'bulb-input'
   *
   * const s = Mouse
   *   .position(document)
   *   .throttle(1000)
   *
   * s.subscribe(console.log) // [1, 1], [2, 2], ...
   */
  throttle (n) {
    return new Signal(throttle(n, this))
  }

  /**
   * Combines the corresponding values emitted by the given signals into
   * tuples. The returned signal will complete when *any* of the signals have
   * completed.
   *
   * @param {...Signal} signals The signals to zip.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = s.zip(t)
   *
   * u.subscribe(console.log) // [1, 4], [2, 5], [3, 6]
   */
  zip (...signals) {
    return new Signal(zipWith(tuple, [this].concat(signals)))
  }

  /**
   * Applies the function `f` to the corresponding values emitted by the given
   * signals. The returned signal will complete when *any* of the signals have
   * completed.
   *
   * @param {Function} f The function to apply to the corresponding values
   * emitted by the signals.
   * @param {...Signal} signals The signals to zip.
   * @returns {Signal} A new signal.
   * @example
   *
   * import { Signal } from 'bulb'
   *
   * const s = Signal.of(1, 2, 3)
   * const t = Signal.of(4, 5, 6)
   * const u = s.zipWith((a, b) => a + b, t)
   *
   * u.subscribe(console.log) // 5, 7, 9
   */
  zipWith (f, ...signals) {
    return new Signal(zipWith(f, [this].concat(signals)))
  }
}
