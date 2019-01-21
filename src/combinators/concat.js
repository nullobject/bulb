import Signal from '../Signal'

/**
 * Concatenates the signals `ss` and emits their values. The returned signal
 * will join the given signals, waiting for each one to complete before joining
 * the next, and will complete once *all* of the given signals have completed.
 *
 * @private
 */
export default function concat (ss) {
  return new Signal(emit => {
    let subscription

    const subscribeNext = () => {
      const a = ss.shift()
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
