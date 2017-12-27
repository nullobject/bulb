import {always, apply, compose, empty, equal, get, head, id, pair, tail} from 'fkit'
import Subscription from './subscription'

/**
 * Creates a new signal.
 *
 * The `mount` function is called when an emit subscribes to the signal. The
 * `mount` function can optionally return another function, which is called
 * when the signal is unmounted.
 *
 * @class Signal
 * @summary The `Signal` class represents a value which changes over time.
 * @param mount A mount function.
 */
export default class Signal {
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
   * @returns A subscription object.
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
      this.mount({next, error, complete})
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
      as.map(apply(emit.next))
      emit.complete()
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
      const handler = compose(emit.next, get('detail'))

      if (target.addListener) {
        target.addListener(type, emit.next)
      } else if (target.addEventListener) {
        target.addEventListener(type, handler, useCapture)
      }

      return () => {
        if (target.addListener) {
          target.removeListener(type, emit.next)
        } else {
          target.removeEventListener('type', handler, useCapture)
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
  static sequentially (n, as) {
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
      return this.subscribe({...emit, next})
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
   * Returns a signal that delays the signal values by `n` milliseconds.
   *
   * @param n The number of milliseconds between each clock tick.
   * @returns A new signal.
   */
  delay (n) {
    let id

    return new Signal(emit => {
      const next = a => {
        id = setTimeout(() => emit.next(a), n)
      }

      const complete = () => {
        setTimeout(() => emit.complete(), n)
      }

      this.subscribe({...emit, next, complete})

      return () => clearTimeout(id)
    })
  }

  /**
   * Returns a signal that applies the function `f` to the signal values. The
   * function `f` must also return a `Signal`.
   *
   * @param f A unary function that returns a new signal.
   * @returns A new signal.
   */
  concatMap (f) {
    return new Signal(emit => {
      const next = a => f(a).subscribe(emit.next, emit.error)
      return this.subscribe({...emit, next})
    })
  }

  /**
   * Returns a signal that applies the function `f` to the signal values.
   *
   * @param f A unary function that returns a new signal value.
   * @returns A new signal.
   */
  map (f) {
    return new Signal(emit => {
      const next = compose(emit.next, f)
      this.subscribe({...emit, next})
    })
  }

  /**
   * Returns a signal that filters the signal values using the predicate `p`.
   *
   * @param p A predicate function that returns truthy of falsey for a given
   * signal value.
   * @returns A new signal.
   */
  filter (p) {
    return new Signal(emit => {
      const next = a => { if (p(a)) { emit.next(a) } }
      return this.subscribe({...emit, next})
    })
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
    return new Signal(emit => {
      // Fold the next value with the previous value.
      const next = b => { a = f(a, b) }

      const complete = () => {
        // Emit the final value.
        emit.next(a)
        emit.complete()
      }

      return this.subscribe({...emit, next, complete})
    })
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
    return new Signal(emit => {
      // Emit the starting value.
      emit.next(a)

      // Fold the current value with the previous value and emit the next value
      const next = b => {
        a = f(a, b)
        emit.next(a)
      }

      return this.subscribe({...emit, next})
    })
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
   * @param f A binary function.
   * @param a A starting value.
   * @returns A new signal.
   *
   */
  stateMachine (f, a) {
    return new Signal(emit => {
      const next = b => {
        // Fold the next value with the previous value.
        a = f(a, b, emit)
      }

      return this.subscribe({...emit, next})
    })
  }

  /**
   * Returns a new signal that merges the signal with one or more signals.
   *
   * @param ss A list of signals.
   * @returns A new signal.
   */
  merge (...ss) {
    let count = 0

    // Allow the signals to be given as an array.
    if (ss.length === 1 && Array.isArray(ss[0])) {
      ss = ss[0]
    }

    return new Signal(emit => {
      const complete = () => {
        if (++count > ss.length) { emit.complete() }
      }

      this.subscribe({...emit, complete})

      // Emit values from any signal.
      const subscriptions = ss.map(s => s.subscribe({...emit, complete}))

      return () => subscriptions.forEach(s => s.unsubscribe())
    })
  }

  /**
   * Zips the signal with another signal to produce a signal that emits pairs of
   * values.
   *
   * @param s A signal.
   * @returns A new signal.
   */
  zip (s) {
    return this.zipWith(pair, s)
  }

  /**
   * Generalises the `zip` function to zip the signals using a binary function
   * `f`.
   *
   * @param f A binary function that returns a new signal value for the two
   * given signal values.
   * @param s A signal.
   * @returns A new signal.
   */
  zipWith (f, s) {
    let as = null
    let count = 0

    return new Signal(emit => {
      const next = (a, index) => {
        if (!as) { as = [] }

        as[index] = a

        if (as.length >= 2) {
          emit.next(f(as[0], as[1]))
          as = null
        }
      }

      const complete = () => {
        if (++count >= 2) { emit.complete() }
      }

      this.subscribe(a => next(a, 0), emit.error, complete)

      const subscription = s.subscribe(a => next(a, 1), emit.error, complete)

      return () => subscription.unsubscribe()
    })
  }

  /**
   * Emits the most recent value when there is an event on the sampler signal
   * `s`.
   *
   * @param s A signal.
   * @returns A new signal.
   */
  sample (s) {
    return this.sampleWith(id, s)
  }

  /**
   * Generalises the `sample` function to sample the most recent value when
   * there is an event on the sampler signal `s`. The most recent value, and the
   * sampler value are combined using the binary function `f`.
   *
   * @param f A binary function.
   * @param s A signal.
   * @returns A new signal.
   */
  sampleWith (f, s) {
    let lastValue

    return new Signal(emit => {
      // Buffer the value.
      const next = a => { lastValue = a }

      this.subscribe({...emit, next})

      // Emit the buffered value.
      const subscription = s.subscribe(a => emit.next(f(lastValue, a)), emit.error)

      // Unsubscribe the sampler.
      return () => subscription.unsubscribe()
    })
  }

  /**
   * Pauses emitting values when the most recent value on the sampler signal `s`
   * is truthy. It will resume emitting events after there is a falsey value.
   *
   * @param s A signal.
   * @returns A new signal.
   */
  hold (s) {
    return this.holdWith(id, s)
  }

  /**
   * Generalises the `hold` function to pause emitting values when the predicate
   * function `f` is true for the most recent sampler signal value.
   *
   * @param p A predicate function.
   * @param s A signal.
   * @returns A new signal.
   */
  holdWith (p, s) {
    let lastValue

    return new Signal(emit => {
      const next = a => { if (!lastValue) { emit.next(a) } }

      this.subscribe({...emit, next})

      // Store the hold value.
      const subscription = s.subscribe(a => { lastValue = p(a) }, emit.error)

      // Unsubscribe the sampler.
      return () => subscription.unsubscribe()
    })
  }

  /**
   * Removes duplicate values from the signal.
   *
   * @returns A new signal.
   */
  dedupe () {
    return this.dedupeWith(equal)
  }

  /**
   * Removes duplicate values from the signal using the comparator function `f`.
   *
   * @param f A comparator function.
   * @returns A new signal.
   */
  dedupeWith (f) {
    return this.stateMachine((a, b, emit) => {
      if (!f(a, b)) { emit.next(b) }
      return b
    })
  }

  /**
   * A higher-order signal function (operates on a signal that emits other
   * signals) that emits events from the most recent signal value.
   *
   * @returns A new signal.
   */
  switch () {
    let subscription

    return new Signal(emit => {
      const next = a => {
        if (subscription) { subscription.unsubscribe() }
        if (!(a instanceof Signal)) { throw new Error('Signal value must be a signal') }
        subscription = a.subscribe(emit)
      }

      this.subscribe({...emit, next})

      return () => {
        if (subscription) { subscription.unsubscribe() }
      }
    })
  }
}
