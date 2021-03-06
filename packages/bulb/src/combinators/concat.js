/**
 * Concatenates the signals `ss` and emits their values. The returned signal
 * will join the given signals, waiting for each one to complete before joining
 * the next, and will complete once *all* of the given signals have completed.
 *
 * @private
 */
export default function concat (ss) {
  return emit => {
    let subscription

    const innerComplete = () => {
      if (subscription) {
        subscription.unsubscribe()
        subscription = null
      }
      subscribeNext()
    }

    // Subscribes to the next signal in the queue
    const subscribeNext = () => {
      if (ss.length > 0) {
        const a = ss.shift()
        if (a !== undefined) {
          subscription = a.subscribe({ ...emit, complete: innerComplete })
        }
      } else {
        emit.complete()
      }
    }

    subscribeNext()

    return () => {
      if (subscription) { subscription.unsubscribe() }
    }
  }
}
