import Signal from '../Signal'

/**
 * Concatenates the signals `ss` and emits their values. The returned signal
 * will join the given signals, waiting for each one to complete before joining
 * the next, and will complete once *all* of the given signals have completed.
 *
 * @param {Array} ss The signals to concatenate.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, concat } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = Signal.fromArray([4, 5, 6])
 * const u = concat(s, t)
 *
 * u.subscribe(console.log) // 1, 2, 3, 4, 5, 6
 */
export default function concat (...ss) {
  const signals = ss.slice(0)

  return new Signal(emit => {
    let subscription

    const subscribeNext = () => {
      const a = signals.shift()
      if (a) {
        if (subscription) { subscription.unsubscribe() }
        subscription = a.subscribe({ ...emit, complete: subscribeNext })
      } else {
        emit.complete()
      }
    }

    subscribeNext()

    return () => {
      if (subscription) { subscription.unsubscribe() }
    }
  })
}
