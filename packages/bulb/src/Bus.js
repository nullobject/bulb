import { Signal } from './Signal'

/**
 * The `Bus` class represents a special type of `Signal` that can broadcast
 * values to its observers. You can connect other signals to a bus, as well as
 * manually emit values and errors.
 *
 * @example
 *
 * import { Bus, Signal } from 'bulb'
 *
 * const bus = new Bus()
 *
 * // Subscribe to the bus and log emitted values to the console.
 * bus.subscribe(console.log)
 *
 * // Emit a value on the bus.
 * bus.next(0)
 *
 * // Connect a signal to the bus.
 * const s = Signal.of(1, 2, 3)
 * bus.connect(s)
 */
export class Bus extends Signal {
  constructor () {
    super(emit => {
      this.emit = emit
      return () => { this.emit = null }
    })
  }

  /**
   * Emits the given value to the observers.
   *
   * @param value The value to emit.
   */
  next (value) {
    if (this.emit) {
      this.emit.next(value)
    }
  }

  /**
   * Emits the given error to the observers.
   *
   * @param e The error to emit.
   */
  error (e) {
    if (this.emit) {
      this.emit.error(e)
    }
  }

  /**
   * Completes the bus. All observers will be completed, and any further calls
   * to `next` or `error` will be ignored.
   */
  complete () {
    if (this.emit) {
      this.emit.complete()
    }
  }

  /**
   * Connects the bus to the given signal. Any values emitted by the signal
   * will be forwarded to the bus.
   *
   * @params {Signal} The signal to connect to the bus.
   * @returns {Subscription} A subscription handle.
   */
  connect (signal) {
    return signal.subscribe(this)
  }
}
