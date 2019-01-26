/**
 * The `Subscription` class represents an observer who has subscribed to
 * a `Signal`.
 *
 * @param {Object} emit An emit object.
 * @param {Function} unsubscribe An unsubscribe function.
 */
class Subscription {
  constructor (emit, unsubscribe) {
    this.emit = emit

    /**
     * Unsubscribes the observer from the signal.
     *
     * @function
     */
    this.unsubscribe = unsubscribe
  }
}

export default Subscription
