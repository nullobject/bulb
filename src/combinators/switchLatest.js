import Signal from '../Signal'

/**
 * A higher-order signal function (operates on a signal that emits other
 * signals) that emits events from the most recent signal value.
 *
 * @param {Signal} s A signal.
 * @returns {Signal} A new signal.
 */
export default function switchLatest (s) {
  return new Signal(emit => {
    let subscription2

    const value = a => {
      if (!(a instanceof Signal)) { throw new Error('Signal value must be a signal') }
      if (subscription2) { subscription2.unsubscribe() }
      subscription2 = a.subscribe(emit)
    }

    const subscription1 = s.subscribe({ ...emit, value })

    return () => {
      subscription1.unsubscribe()
      if (subscription2) { subscription2.unsubscribe() }
    }
  })
}
