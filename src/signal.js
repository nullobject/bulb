'use strict'

var F = require('fkit')

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
   * Subscribes to the signal with the callbacks `next`, `error`, and `end`.
   *
   * @param next A callback function.
   * @param error A callback function.
   * @param end A callback function.
   * @function Signal#subscribe
   */
  this.subscribe = subscribe
}

Signal.prototype.constructor = Signal

/**
 * Returns a new signal that contains a single value `a`.
 *
 * @param a A value.
 * @returns A new signal.
 */
Signal.of = function (a) {
  return new Signal(function (next, error, done) {
    if (a) { next(a) }
    done()
  })
}

/**
 * Returns a new signal that emits values from the array of `as`.
 *
 * @param as An array of values.
 * @returns A new signal.
 */
Signal.fromArray = function (as) {
  return new Signal(function (next, error, done) {
    as.map(F.apply(next))
    if (done) { done() }
  })
}

/**
 * Returns a new signal from the callback function `f`.
 *
 * @param f A callback function.
 * @returns A new signal.
 */
Signal.fromCallback = function (f) {
  return new Signal(function (next, error, done) {
    f(function (message, value) {
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
 * @param target A DOM element.
 * @param type A string representing the event type to listen for.
 * @returns A new signal.
 */
Signal.fromEvent = function (target, type) {
  return new Signal(function (next, error, done) {
    if (target.on) {
      target.on(type, next)
    } else if (target.addEventListener) {
      target.addEventListener(type, F.compose(next, F.get('detail')))
    }
  })
}

/**
 * Returns a new signal from the promise `p`.
 *
 * @param p A Promises/A+ conformant promise.
 * @returns A new signal.
 */
Signal.fromPromise = function (p) {
  return new Signal(function (next, error, done) {
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
Signal.sequentially = function (n, as) {
  var handle

  return new Signal(function (next, error, done) {
    handle = setInterval(function () {
      next(F.head(as))

      as = F.tail(as)

      if (F.empty(as)) {
        clearInterval(handle)
        done()
      }
    }, n)
  })
}

/**
 * Returns a new signal that delays the signal values by `n` milliseconds.
 *
 * @param n The number of milliseconds between each clock tick.
 * @returns A new signal.
 */
Signal.prototype.delay = function (n) {
  var env = this

  return F.copy(this, {
    subscribe: function (next, error, done) {
      env.subscribe(
        function (a) { setTimeout(function () { next(a) }, n) },
        error,
        function () { setTimeout(function () { done() }, n) }
      )
    }
  })
}

/**
 * Returns a new signal that applies the function `f` to the signal values.
 *
 * @param f A unary function that returns a signal.
 * @returns A new signal.
 */
Signal.prototype.concatMap = function (f) {
  var env = this

  return F.copy(this, {
    subscribe: function (next, error, done) {
      env.subscribe(function (a) {
        f(a).subscribe(next, error, function () {})
      }, error, done)
    }
  })
}

/**
 * Returns a new signal that applies the function `f` to the signal values.
 *
 * @param f A unary function that returns a signal value.
 * @returns A new signal.
 */
Signal.prototype.map = function (f) {
  var env = this

  return F.copy(this, {
    subscribe: function (next, error, done) {
      env.subscribe(F.compose(next, f), error, done)
    }
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
  var env = this

  return F.copy(this, {
    subscribe: function (next, error, done) {
      env.subscribe(function (a) {
        if (p(a)) { next(a) }
      }, error, done)
    }
  })
}

/**
 * Returns a new signal that reduces the signal values with the starting value
 * `a` and binary function `f`.
 *
 * @param a A starting value.
 * @param f A binary function.
 * @returns A new signal.
 */
Signal.prototype.fold = function (a, f) {
  var env = this

  return F.copy(this, {
    subscribe: function (next, error, done) {
      env.subscribe(
        function (b) {
          a = f(a, b)
          return a
        },
        error,
        function () {
          next(a)
          return done()
        }
      )
    }
  })
}

/**
 * Returns a new signal that scans the signal values with the starting value
 * `a` and binary function `f`.
 *
 * @param a A starting value.
 * @param f A binary function.
 * @returns A new signal.
 */
Signal.prototype.scan = function (a, f) {
  var env = this

  return F.copy(this, {
    subscribe: function (next, error, done) {
      next(a)
      env.subscribe(function (b) {
        a = f(a, b)
        return next(a)
      }, error, done)
    }
  })
}

/**
 * Returns a new signal that merges the signal with one or more signals.
 *
 * @function Signal#merge
 * @param ss A list of signals.
 * @returns A new signal.
 */
Signal.prototype.merge = F.variadic(function (ss) {
  var env = this

  return F.copy(this, {
    subscribe: function (next, error, done) {
      var count = 0
      var onDone = function () {
        if (++count > ss.length) { done() }
      };

      [env].concat(ss).map(function (s) {
        s.subscribe(next, error, onDone)
      })
    }
  })
})

/**
 * Returns a new signal that splits the signal into one or more signals.
 *
 * @param n A number.
 * @returns An array of signals.
 */
Signal.prototype.split = function (n) {
  var env = this
  var nexts = []
  var errors = []
  var dones = []
  var isSubscribed = false

  var signals = F
    .range(0, n)
    .map(function (_) {
      return F.copy(env, {
        subscribe: function (next, error, done) {
          nexts.push(next)
          errors.push(next)
          dones.push(done)
          onSubscribe()
        }
      })
    })

  return signals

  function onSubscribe () {
    if (!isSubscribed) {
      env.subscribe(
        function (a) { nexts.map(F.applyRight(a)) },
        function () { errors.map(F.applyRight()) },
        function () { dones.map(F.applyRight()) }
      )
    }

    isSubscribed = true
  }
}

/**
 * Returns a new signal that zips the signal with one or more signals.
 *
 * @function Signal#zip
 * @param ss A list of signals.
 * @returns A new signal.
 */
Signal.prototype.zip = F.variadic(function (ss) {
  var env = this

  return F.copy(this, {
    subscribe: function (next, error, done) {
      var as = null
      var count = 0

      var onNext = function (a, index) {
        if (!as) { as = F.array(ss.length) }

        as[index] = a

        if (as.length > ss.length) {
          next(as)
          as = null
        }
      }

      var onDone = function () {
        if (++count > ss.length) { done() }
      };

      [env].concat(ss).map(function (s, index) {
        s.subscribe(function (a) { onNext(a, index) }, error, onDone)
      })
    }
  })
})

module.exports = Signal
