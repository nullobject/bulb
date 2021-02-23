/**
 * Applies a function `f`, that returns a `Signal`, to each value emitted by
 * the signal `s`. The returned signal will join all signals returned by the
 * function, waiting for each one to complete before merging the next.
 *
 * @private
 */
export default function concatMap (f, s) {
  return emit => {
    const queue = []
    let innerSubscription
    let innerCompleted = false
    let outerCompleted = false

    // Emits a complete event if all signals have completed
    const tryComplete = () => {
      if ((!innerSubscription || innerCompleted) && outerCompleted) {
        emit.complete()
      }
    }

    const innerComplete = () => {
      innerCompleted = true
      if (innerSubscription) {
        innerSubscription.unsubscribe()
        innerSubscription = null
      }
      subscribeNext()
      tryComplete()
    }

    const outerComplete = () => {
      outerCompleted = true
      tryComplete()
    }

    // Subscribes to the next signal in the queue
    const subscribeNext = () => {
      if (queue.length > 0) {
        const a = queue.shift()
        if (a !== undefined) {
          const b = f(a)
          if (!(b && b.subscribe instanceof Function)) { throw new Error('Value must be a signal') }
          innerSubscription = b.subscribe({
            ...emit,
            complete: innerComplete
          })
          innerCompleted = false
        }
      }
    }

    // Enqueues the given signal
    const enqueueSignal = a => {
      queue.push(a)
      if (!innerSubscription) { subscribeNext() }
    }

    const outerSubscription = s.subscribe({
      ...emit,
      next: enqueueSignal,
      complete: outerComplete
    })

    return () => {
      if (innerSubscription) { innerSubscription.unsubscribe() }
      outerSubscription.unsubscribe()
    }
  }
}
