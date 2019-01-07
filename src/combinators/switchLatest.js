import Signal from '../Signal'

/**
 * A higher-order signal (a signal that emits other signals) that emits events
 * from the most recent signal value.
 *
 * @param {Signal} s A signal that emits other signals.
 * @returns {Signal} A new signal.
 */
export default function switchLatest (s) {
  return new Signal(emit => {
    let childSubscription

    const value = a => {
      if (!(a instanceof Signal)) { throw new Error('Signal value must be a signal') }
      if (childSubscription) { childSubscription.unsubscribe() }
      childSubscription = a.subscribe({ value: emit.value, error: emit.error })
    }

    const parentSubscription = s.subscribe({ ...emit, value })

    return () => {
      parentSubscription.unsubscribe()
      if (childSubscription) { childSubscription.unsubscribe() }
    }
  })
}
