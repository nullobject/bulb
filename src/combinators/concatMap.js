import { curry } from 'fkit'

import Signal from '../Signal'

/**
 * Applies a function `f`, which returns a `Signal`, to each value emitted by
 * the signal `s`. The returned signal will merge all signals returned by the
 * function, waiting for each one to complete before merging the next.
 *
 * @param {Function} f The function to apply to each value emitted by the
 * signal. It must also return a `Signal`.
 * @param {Signal} s The signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, concatMap } from 'bulb'
 *
 * const s = Signal.fromArray([1, 2, 3])
 * const t = concatMap(a => Signal.of(a + 1), s)
 *
 * t.subscribe(console.log) // 2, 3, 4
 */
export function concatMap (f, s) {
  return new Signal(emit => {
    let queue = []
    let innerSubscription

    // Subscribes to the next signal in the queue.
    const subscribeNext = () => {
      if (innerSubscription) {
        innerSubscription.unsubscribe()
        innerSubscription = null
      }

      if (queue.length > 0) {
        const a = queue.shift()
        if (a !== undefined) {
          const b = f(a)
          if (!(b instanceof Signal)) {
            throw new Error('Signal value must be a signal')
          }
          innerSubscription = b.subscribe({ ...emit, complete: subscribeNext })
        }
      }
    }

    // Enqueues the given signal.
    const enqueueSignal = a => {
      queue.push(a)
      if (!innerSubscription) {
        subscribeNext()
      }
    }

    const outerSubscription = s.subscribe({ ...emit, value: enqueueSignal })

    return () => {
      if (innerSubscription) { innerSubscription.unsubscribe() }
      outerSubscription.unsubscribe()
    }
  })
}

export default curry(concatMap)
