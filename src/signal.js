const F = require('fkit')

/**
 * Returns a new signal with the `subscribe` function.
 *
 * The `subscribe` function is called by an observer who wishes to subscribe to
 * the signal values.
 *
 * @class
 * @summary The Signal class represents a value which changes over time.
 * @param subscribe A subscribe function.
 * @author Josh Bassett
 */
function Signal (subscribe) {
  /**
   * Subscribes to the signal with the callbacks `next`, `error`, and `complete`.
   *
   * @param next A callback function.
   * @param error A callback function.
   * @param complete A callback function.
   * @function Signal#subscribe
   */
  this.subscribe = subscribe
}

Signal.prototype.constructor = Signal

/**
 * Returns a new signal that contains no values.
 *
 * @returns A new signal.
 */
Signal.empty = function () {
  return new Signal((next, error, complete) => {
    if (complete) { complete() }
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
    if (a) { next(a) }
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
    if (complete) { complete() }
  })
}

/**
 * Returns a new signal from the callback function `f`.
 *
 * @param f A callback function.
 * @returns A new signal.
 */
Signal.fromCallback = function (f) {
  return new Signal((next, error, complete) => {
    f((message, value) => {
      if (typeof message !== 'undefined' && message !== null) {
        error(message)
      } else {
        next(value)
      }
    })
  })
}

/**
 * Returns a new signal by listening for events of `type` on the `target`
 * object.
 *
 * @param type A string representing the event type to listen for.
 * @param target A DOM element.
 * @returns A new signal.
 */
Signal.fromEvent = F.curry(function (type, target) {
  return new Signal((next, error, complete) => {
    if (target.on) {
      target.on(type, next)
    } else if (target.addEventListener) {
      target.addEventListener(type, F.compose(next, F.get('detail')))
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
    p.then(next, error)
  })
}

/**
 * Returns a new signal that emits a value from the array of `as` every `n`
 * milliseconds.
 *
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
  })
})

/**
 * Returns a new signal that delays the signal values by `n` milliseconds.
 *
 * @param n The number of milliseconds between each clock tick.
 * @returns A new signal.
 */
Signal.prototype.delay = function (n) {
  return new Signal((next, error, complete) => {
    this.subscribe(
      a => setTimeout(() => next(a), n),
      error,
      () => setTimeout(() => complete(), n)
    )
  })
}

/**
 * Returns a new signal that applies the function `f` to the signal values.
 *
 * @param f A unary function that returns a signal.
 * @returns A new signal.
 */
Signal.prototype.concatMap = function (f) {
  return new Signal((next, error, complete) => {
    this.subscribe(a => {
      f(a).subscribe(next, error, () => {})
    }, error, complete)
  })
}

/**
 * Returns a new signal that applies the function `f` to the signal values.
 *
 * @param f A unary function that returns a signal value.
 * @returns A new signal.
 */
Signal.prototype.map = function (f) {
  return new Signal((next, error, complete) => {
    this.subscribe(F.compose(next, f), error, complete)
  })
}

/**
 * Returns a new signal that filters the signal values using the predicate
 * function `p`.
 *
 * @param p A predicate function.
 * @returns A new signal.
 */
Signal.prototype.filter = function (p) {
  return new Signal((next, error, complete) => {
    this.subscribe(a => {
      if (p(a)) { next(a) }
    }, error, complete)
  })
}

/**
 * Returns a new signal that reduces the signal values with the starting value
 * `a` and binary function `f`.
 *
 * @param f A binary function.
 * @param a A starting value.
 * @returns A new signal.
 */
Signal.prototype.fold = F.curry(function (f, a) {
  return new Signal((next, error, complete) => {
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
  })
})

/**
 * Returns a new signal that scans the signal values with the starting value
 * `a` and binary function `f`.
 *
 * @param f A binary function.
 * @param a A starting value.
 * @returns A new signal.
 */
Signal.prototype.scan = F.curry(function (f, a) {
  return new Signal((next, error, complete) => {
    next(a)
    this.subscribe(b => {
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
 * Returns a new signal that zips the signal with one or more signals.
 *
 * @function Signal#zip
 * @param ss A list of signals.
 * @returns A new signal.
 */
Signal.prototype.zip = F.variadic(function (ss) {
  return new Signal((next, error, complete) => {
    let as = null
    let count = 0

    const onNext = (a, index) => {
      if (!as) { as = F.array(ss.length) }

      as[index] = a

      if (as.length > ss.length) {
        next(as)
        as = null
      }
    }

    const onComplete = () => {
      if (++count > ss.length) { complete() }
    };

    [this].concat(ss).map((s, index) => s.subscribe(a => onNext(a, index), error, onComplete))
  })
})

module.exports = Signal
