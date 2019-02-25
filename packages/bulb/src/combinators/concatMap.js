/**
 * Applies a function `f`, that returns a `Signal`, to each value emitted by
 * the signal `s`. The returned signal will join all signals returned by the
 * function, waiting for each one to complete before merging the next.
 *
 * @private
 */
export default function concatMap (f, s) {
  return emit => {
    let innerSubscription

    const queue = []

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
          if (!(b && b.subscribe instanceof Function)) { throw new Error('Value must be a signal') }
          innerSubscription = b.subscribe({ ...emit, complete: subscribeNext })
        }
      }
    }

    // Enqueues the given signal.
    const enqueueSignal = a => {
      queue.push(a)
      if (!innerSubscription) { subscribeNext() }
    }

    const outerSubscription = s.subscribe({ ...emit, next: enqueueSignal })

    return () => {
      if (innerSubscription) { innerSubscription.unsubscribe() }
      outerSubscription.unsubscribe()
    }
  }
}
