/**
 * Creates a new subscription object for the `observer`.
 *
 * The observer may unsubscribe from the signal by calling the `unsubscribe`
 * method.
 *
 * @class
 * @summary The `Subscription` class represents an observer who has subscribed
 * to a `Signal`.
 * @param observer An observer object.
 * @param unsubscribe An unsubscribe function.
 */
function Subscription (observer, unsubscribe) {
  this.observer = observer

  /**
   * Unsubscribes the observer from the signal.
   *
   * @function Subscription#unsubscribe
   */
  this.unsubscribe = unsubscribe
}

Subscription.prototype.constructor = Subscription

module.exports = Subscription
