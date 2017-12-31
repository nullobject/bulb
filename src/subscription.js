/**
 * The `Subscription` class represents an observer who has subscribed to
 * a `Signal`.
 *
 * @summary The Subscription class
 */
class Subscription {
  /**
   * Creates a new subscription for the `emit` object.
   *
   * The observer may unsubscribe from the signal by calling the `unsubscribe`
   * method.
   *
   * @param emit An observer.
   * @param unsubscribe An unsubscribe function.
   */
  constructor (emit, unsubscribe) {
    this.emit = emit

    /**
     * Unsubscribes the observer from the signal.
     *
     * @function Subscription#unsubscribe
     */
    this.unsubscribe = unsubscribe
  }
}

export default Subscription
