import Subscription from './subscription'
import { always, apply, empty, head, tail } from 'fkit'
import { concatMap, dedupe, dedupeWith, debounce, delay, encode, filter, fold, hold, map, merge, sample, scan, stateMachine, switchLatest, throttle, zip, zipWith } from './combinators'

/**
 * The `Signal` class represents a value which changes over time.
 *
 * @summary The Signal class
 */
class Signal {
  /**
   * Creates a new signal.
   *
   * The `mount` function is called when an emit subscribes to the signal. The
   * `mount` function can optionally return another function, which is called
   * when the signal is unmounted.
   *
   * @param mount A mount function.
   */
  constructor (mount) {
    if (typeof mount !== 'function') {
      throw new TypeError('Signal mount must be a function')
    }

    this._mount = mount
    this._unmount = undefined
    this._subscriptions = new Set()
  }

  /**
   * Mounts the signal with an `emit`.
   *
   * The `mount` function optionally returns another function. We call this
   * function when we want to unmount the signal.
   *
   * @param emit An observer.
   */
  mount (emit) {
    try {
      this._unmount = this._mount(emit)
    } catch (e) {
      emit.error(e)
    }
  }

  /**
   * Unmounts the signal.
   */
  unmount () {
    if (typeof this._unmount === 'function') {
      try {
        this._unmount()
      } catch (e) {}
    }

    this._unmount = undefined
  }

  /**
   * Subscribes to the signal with the callback functions `next`, `error`, and
   * `complete`.
   *
   * @param next A callback function.
   * @param error A callback function.
   * @param complete A callback function.
   * @returns A new subscription.
   */
  subscribe (emit, ...args) {
    if (typeof emit === 'function') {
      emit = { next: emit, error: args[0], complete: args[1] }
    } else if (typeof emit !== 'object') {
      emit = {}
    }

    const next = value => {
      for (let s of this._subscriptions) {
        if (typeof s.emit.next === 'function') {
          s.emit.next(value)
        }
      }
    }

    const error = value => {
      for (let s of this._subscriptions) {
        if (typeof s.emit.error === 'function') {
          s.emit.error(value)
        }
      }
    }

    const complete = () => {
      for (let s of this._subscriptions) {
        if (typeof s.emit.complete === 'function') {
          s.emit.complete()
        }
      }
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

    // Call the mount function if we added the first subscription.
    if (this._subscriptions.size === 1) {
      this.mount({ next, error, complete })
    }

    return subscription
  }

  /**
   * Returns a signal that never emits any values and has already completed.
   *
   * It is not very useful on its own, but it can be used with other combinators
   * (e.g. `fold`, `scan`, etc).
   *
   * @returns A new signal.
   */
  static empty () {
    return new Signal(emit => {
      emit.complete()
    })
  }

  /**
   * Returns a signal that never emits any values or completes.
   *
   * It is not very useful on its own, but it can be used with other combinators
   * (e.g. `fold`, `scan`, etc).
   *
   * @returns A new signal.
   */
  static never () {
    return new Signal(always)
  }

  /**
   * Returns a signal that emits a single value `a`. It completes after the value
   * has been emited.
   *
   * @param a A value.
   * @returns A new signal.
   */
  static of (a) {
    return new Signal(emit => {
      emit.next(a)
      emit.complete()
    })
  }

  /**
   * Returns a signal that emits values from the array of `as`. It completes
   * after the last value in the array has been emitted.
   *
   * @param as An array of values.
   * @returns A new signal.
   */
  static fromArray (as) {
    return new Signal(emit => {
      setTimeout(() => {
        as.map(apply(emit.next))
        emit.complete()
      }, 0)
    })
  }

  /**
   * Returns a signal that emits the result of the callback function `f`.
   *
   * @param f A callback function.
   * @returns A new signal.
   */
  static fromCallback (f) {
    return new Signal(emit => {
      f((e, a) => {
        if (typeof e !== 'undefined' && e !== null) {
          emit.error(e)
        } else {
          emit.next(a)
        }
      })
    })
  }

  /**
   * Returns a signal that emits events of `type` from the
   * `EventListener`-compatible `target` object (e.g. a DOM element).
   *
   * @param type A string representing the event type to listen for.
   * @param target A DOM element.
   * @returns A new signal.
   */
  static fromEvent (type, target, useCapture = true) {
    return new Signal(emit => {
      if (target.addListener) {
        target.addListener(type, emit.next)
      } else if (target.addEventListener) {
        target.addEventListener(type, emit.next, useCapture)
      }

      return () => {
        if (target.addListener) {
          target.removeListener(type, emit.next)
        } else {
          target.removeEventListener('type', emit.next, useCapture)
        }
      }
    })
  }

  /**
   * Returns a signal that emits the result of the promise `p`. It completes
   * after the promise has resolved.
   *
   * @param p A Promises/A+ conformant promise.
   * @returns A new signal.
   */
  static fromPromise (p) {
    return new Signal(emit => {
      p.then(emit.next, emit.error).finally(emit.complete)
    })
  }

  /**
   * Returns a signal that periodically emits a value every `n` milliseconds.
   *
   * @example
   *   // A signal that emits the value 'x' every second.
   *   Signal.periodic(1000).always('x')
   *
   * @param n The number of milliseconds between each emitted value.
   * @returns A new signal.
   */
  static periodic (n) {
    let id

    return new Signal(emit => {
      id = setInterval(() => emit.next(), n)
      return () => clearInterval(id)
    })
  }

  /**
   * Returns a signal that emits a value from the array of `as` every `n`
   * milliseconds.
   *
   * @param n The number of milliseconds between each clock tick.
   * @param as A list.
   * @returns A new signal.
   */
  static sequential (n, as) {
    let id

    return new Signal(emit => {
      id = setInterval(() => {
        emit.next(head(as))

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
   * Returns a signal that replaces the signal values with a constant.
   *
   * @param c The constant value.
   * @returns A new signal.
   */
  always (c) {
    return new Signal(emit => {
      const next = () => emit.next(c)
      return this.subscribe({ ...emit, next })
    })
  }

  /**
   * Creates a new signal that emits the signal value `a` before all other
   * values.
   *
   * @param a A signal value.
   * @returns A new signal.
   */
  startWith (a) {
    return new Signal(emit => {
      emit.next(a)
      return this.subscribe(emit)
    })
  }

  /**
   * Delays events emitted by the signal for `n` milliseconds.
   *
   * @param n A number.
   * @returns A new signal.
   */
  delay (n) {
    return delay(n, this)
  }

  /**
   * Debounces the signal to only emit an event `n` milliseconds after the last
   * burst of events.
   *
   * @param n A number.
   * @returns A new signal.
   */
  debounce (n) {
    return debounce(n, this)
  }

  /**
   * Limits the rate of events emitted by the signal to allow at most one event
   * every `n` milliseconds.
   *
   * @param n A number.
   * @returns A new signal.
   */
  throttle (n) {
    return throttle(n, this)
  }

  /**
   * Returns a signal that applies the function `f` to the signal values. The
   * function `f` must also return a `Signal`.
   *
   * @param f A unary function that returns a new signal.
   * @returns A new signal.
   */
  concatMap (f) {
    return concatMap(f, this)
  }

  /**
   * Returns a signal that applies the function `f` to the signal values.
   *
   * @param f A unary function that returns a new signal value.
   * @returns A new signal.
   */
  map (f) {
    return map(f, this)
  }

  /**
   * Returns a signal that filters the signal values using the predicate `p`.
   *
   * @param p A predicate function that returns truthy of falsey for a given
   * signal value.
   * @returns A new signal.
   */
  filter (p) {
    return filter(p, this)
  }

  /**
   * Returns a signal that folds the signal values with the starting value `a`
   * and a binary function `f`. The final value is emitted when the signal
   * completes.
   *
   * @param f A binary function.
   * @param a A starting value.
   * @returns A new signal.
   */
  fold (f, a) {
    return fold(f, a, this)
  }

  /**
   * Returns a signal that scans the signal values with the starting value `a`
   * and a binary function `f`.
   *
   * Unlike the `fold` function, the signal values are emitted incrementally.
   *
   * @param f A binary function that returns a new signal value for the given
   * starting value and signal value.
   * @param a A starting value.
   * @returns A new signal.
   */
  scan (f, a) {
    return scan(f, a, this)
  }

  /**
   * Returns a new signal that runs a state machine, with the starting value
   * `a` and transform function `f`.
   *
   * The transform function should return the new state. It can also optionally
   * emit values or errors using the `emit` argument.
   *
   * @example
   *   signal.stateMachine((a, b, emit) => {
   *     emit.next(a * b)
   *     return a + b
   *   }, 0)
   *
   * @param f A ternary function.
   * @param a A starting value.
   * @returns A new signal.
   *
   */
  stateMachine (f, a) {
    return stateMachine(f, a, this)
  }

  /**
   * Merges the signal with the given signals.
   *
   * The signal completes when *all* of the input signals have completed.
   *
   * @param ss A list of signals.
   * @returns A new signal.
   */
  merge (...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return merge([this].concat(ss))
  }

  /**
   * Combines corresponding values from the given signals into tuples.
   *
   * The signal completes when *any* of the input signals have completed.
   *
   * @param s A signal.
   * @returns A new signal.
   */
  zip (...ss) {
    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return zip([this].concat(ss))
  }

  /**
   * Generalises the `zip` function to combine corresponding values from the
   * given signals using the function `f`.
   *
   * The signal completes when *any* of the input signals have completed.
   *
   * @param f A function.
   * @param ss A list of signals.
   * @returns A new signal.
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
   * @param s A signal.
   * @returns A new signal.
   */
  sample (s) {
    return sample(this, s)
  }

  /**
   * Pauses emitting values from the given signal `s` if the most recent value
   * from the sampler signal is truthy. It will resume emitting events after
   * there is a falsey value.
   *
   * @param s A signal.
   * @returns A new signal.
   */
  hold (s) {
    return hold(this, s)
  }

  /**
   * Removes duplicate values from the signal.
   *
   * @returns A new signal.
   */
  dedupe () {
    return dedupe(this)
  }

  /**
   * Removes duplicate values from the signal using the comparator function `f`.
   *
   * @param f A comparator function.
   * @returns A new signal.
   */
  dedupeWith (f) {
    return dedupeWith(f, this)
  }

  /**
   * A higher-order signal function (operates on a signal that emits other
   * signals) that emits events from the most recent signal value.
   *
   * @returns A new signal.
   */
  switchLatest () {
    return switchLatest(this)
  }

  /**
   * Switches between the given signals based on the last stream value. The
   * stream value should be the index of the stream to switch to.
   *
   * @param ss A list of signals.
   * @returns A new signal.
   */
  encode (...ss) {
    return encode(this, ss)
  }
}

export default Signal
