const F = require('fkit')
const Subscription = require('./subscription')

/**
 * Creates a new signal.
 *
 * The `mount` function is called when an observer subscribes to the signal.
 * The `mount` function can optionally return another function, which is called
 * when the signal is unmounted.
 *
 * @class
 * @summary The `Signal` class represents a value which changes over time.
 * @param mount A mount function.
 */
function Signal (mount) {
  if (typeof mount !== 'function') {
    throw new TypeError('Signal mount must be a function')
  }

  this._mount = mount
  this._unmount = undefined
  this._subscriptions = new Set()
}

Signal.prototype.constructor = Signal

/**
 * Subscribes to the signal with the callback functions `next`, `error`, and
 * `complete`.
 *
 * @function Signal#subscribe
 * @param next A callback function.
 * @param error A callback function.
 * @param complete A callback function.
 * @returns A subscription object.
 */
Signal.prototype.subscribe = function (observer, ...args) {
  if (typeof observer === 'function') {
    observer = { next: observer, error: args[0], complete: args[1] }
  } else if (typeof observer !== 'object') {
    observer = {}
  }

  const onNext = value => {
    for (let s of this._subscriptions) {
      if (typeof s.observer.next === 'function') {
        s.observer.next(value)
      }
    }
  }

  const onError = value => {
    for (let s of this._subscriptions) {
      if (typeof s.observer.error === 'function') {
        s.observer.error(value)
      }
    }
  }

  const onComplete = () => {
    for (let s of this._subscriptions) {
      if (typeof s.observer.complete === 'function') {
        s.observer.complete()
      }
    }
  }

  // Create a new subscription to the signal.
  const subscription = new Subscription(observer, () => {
    // Remove the subscription.
    this._subscriptions.delete(subscription)

    // Call the unmount function if we're removing the last subscription.
    if (this._subscriptions.size === 0 && typeof this._unmount === 'function') {
      this._unmount()
    }
  })

  // Add the subscription.
  this._subscriptions.add(subscription)

  // Call the mount function if we added the first subscription.
  if (this._subscriptions.size === 1) {
    // The `mount` function optionally returns another function. We can call
    // this function when we need to unmount the signal.
    this._unmount = this._mount(onNext, onError, onComplete)
  }

  return subscription
}

/**
 * Returns a new signal that contains no values.
 *
 * @returns A new signal.
 */
Signal.empty = function () {
  return new Signal((next, error, complete) => {
    if (typeof complete === 'function') { complete() }
  })
}

/**
 * Returns a new signal that contains a single value `a`.
 *
 * @param a A value.
 * @returns A new signal.
 */
Signal.of = function (a) {
  return new Signal((next, error, complete) => {
    if (typeof complete === 'function') { next(a) }
    complete()
  })
}

/**
 * Returns a new signal that emits values from the array of `as`.
 *
 * @param as An array of values.
 * @returns A new signal.
 */
Signal.fromArray = function (as) {
  return new Signal((next, error, complete) => {
    as.map(F.apply(next))
    if (typeof complete === 'function') { complete() }
  })
}

/**
 * Returns a new signal from the callback function `f`.
 *
 * @param f A callback function.
 * @returns A new signal.
 */
Signal.fromCallback = function (f) {
  return new Signal((next, error) => {
    f((e, a) => {
      if (typeof e !== 'undefined' && e !== null) {
        error(e)
      } else {
        next(a)
      }
    })
  })
}

/**
 * Returns a new signal by listening for events of `type` on the `target`
 * object.
 *
 * @curried
 * @function Signal.fromEvent
 * @param type A string representing the event type to listen for.
 * @param target A DOM element.
 * @returns A new signal.
 */
Signal.fromEvent = F.curry(function (type, target) {
  return new Signal(next => {
    const handler = F.compose(next, F.get('detail'))

    if (target.on) {
      target.on(type, next)
    } else if (target.addEventListener) {
      target.addEventListener(type, handler, true)
    }

    return () => {
      target.removeEventListener('type', handler, true)
    }
  })
})

/**
 * Returns a new signal from the promise `p`.
 *
 * @param p A Promises/A+ conformant promise.
 * @returns A new signal.
 */
Signal.fromPromise = function (p) {
  return new Signal((next, error, complete) => {
    p.then(next, error).finally(complete)
  })
}

/**
 * Returns a new signal that emits a value from the array of `as` every `n`
 * milliseconds.
 *
 * @curried
 * @function Signal.sequentially
 * @param n The number of milliseconds between each clock tick.
 * @param as A list.
 * @returns A new signal.
 */
Signal.sequentially = F.curry(function (n, as) {
  let id

  return new Signal((next, error, complete) => {
    id = setInterval(() => {
      next(F.head(as))

      as = F.tail(as)

      if (F.empty(as)) {
        clearInterval(id)
        complete()
      }
    }, n)

    return () => clearInterval(id)
  })
})

/**
 * Returns a new signal that delays the signal values by `n` milliseconds.
 *
 * @param n The number of milliseconds between each clock tick.
 * @returns A new signal.
 */
Signal.prototype.delay = function (n) {
  return new Signal((next, error, complete) =>
    this.subscribe(
      a => setTimeout(() => next(a), n),
      error,
      () => setTimeout(() => complete(), n)
    )
  )
}

/**
 * Returns a new signal that applies the function `f` to the signal values.
 *
 * @param f A unary function that returns a signal.
 * @returns A new signal.
 */
Signal.prototype.concatMap = function (f) {
  return new Signal((next, error, complete) =>
    this.subscribe(a => {
      f(a).subscribe(next, error)
    }, error, complete)
  )
}

/**
 * Returns a new signal that applies the function `f` to the signal values.
 *
 * @param f A unary function that returns a signal value.
 * @returns A new signal.
 */
Signal.prototype.map = function (f) {
  return new Signal((next, error, complete) =>
    this.subscribe(F.compose(next, f), error, complete)
  )
}

/**
 * Returns a new signal that filters the signal values using the predicate
 * function `p`.
 *
 * @param p A predicate function.
 * @returns A new signal.
 */
Signal.prototype.filter = function (p) {
  return new Signal((next, error, complete) =>
    this.subscribe(a => {
      if (p(a)) { next(a) }
    }, error, complete)
  )
}

/**
 * Returns a new signal that folds the signal values with the starting value
 * `a` and binary function `f`. The final value is emitted when the signal
 * completes.
 *
 * @curried
 * @function Signal#fold
 * @param f A binary function.
 * @param a A starting value.
 * @returns A new signal.
 */
Signal.prototype.fold = F.curry(function (f, a) {
  return new Signal((next, error, complete) =>
    this.subscribe(
      b => {
        a = f(a, b)
        return a
      },
      error,
      () => {
        next(a)
        return complete()
      }
    )
  )
})

/**
 * Returns a new signal that scans the signal values with the starting value
 * `a` and binary function `f`.
 *
 * @curried
 * @function Signal#scan
 * @param f A binary function.
 * @param a A starting value.
 * @returns A new signal.
 */
Signal.prototype.scan = F.curry(function (f, a) {
  return new Signal((next, error, complete) => {
    // Emit the starting value.
    next(a)

    return this.subscribe(b => {
      a = f(a, b)
      return next(a)
    }, error, complete)
  })
})

/**
 * Returns a new signal that merges the signal with one or more signals.
 *
 * @function Signal#merge
 * @param ss A list of signals.
 * @returns A new signal.
 */
Signal.prototype.merge = F.variadic(function (ss) {
  return new Signal((next, error, complete) => {
    let count = 0

    const onComplete = () => {
      if (++count > ss.length) { complete() }
    };

    [this].concat(ss).map(s => s.subscribe(next, error, onComplete))
  })
})

/**
 * Returns a new signal that zips the signal with another signal.
 *
 * @param s A signal.
 * @returns A new signal.
 */
Signal.prototype.zip = function (s) {
  return this.zipWith(F.pair, s)
}

/**
 * Generalises the `zip` method by zipping the signals using a binary function.
 *
 * @curried
 * @function Signal#zipWith
 * @param f A binary function.
 * @param s A signal.
 * @returns A new signal.
 */
Signal.prototype.zipWith = F.curry(function (f, s) {
  return new Signal((next, error, complete) => {
    let as = null
    let count = 0

    const onNext = (a, index) => {
      if (!as) { as = [] }

      as[index] = a

      if (as.length >= 2) {
        next(f(as[0], as[1]))
        as = null
      }
    }

    const onComplete = () => {
      if (++count >= 2) { complete() }
    };

    [this, s].map((s, index) => s.subscribe(a => onNext(a, index), error, onComplete))
  })
})

module.exports = Signal
