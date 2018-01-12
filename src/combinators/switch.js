import Signal from '../signal'

/**
 * This module defines switch combinators for signals.
 *
 * @private
 * @module combinators/switch
 */

/**
 * A higher-order signal function (operates on a signal that emits other
 * signals) that emits events from the most recent signal value.
 *
 * @param s A signal.
 * @returns A new signal.
 */
export function switchLatest (s) {
  let subscription2

  return new Signal(emit => {
    const next = a => {
      if (!(a instanceof Signal)) { throw new Error('Signal value must be a signal') }
      if (subscription2) { subscription2.unsubscribe() }
      subscription2 = a.subscribe(emit)
    }

    const subscription1 = s.subscribe({...emit, next})

    return () => {
      subscription1.unsubscribe()
      if (subscription2) { subscription2.unsubscribe() }
    }
  })
}

/**
 * Switches between the given signals based on the last stream value. The
 * stream value should be the index of the stream to switch to.
 *
 * @param s A signal.
 * @param ss A list of signals.
 * @returns A new signal.
 */
export function encode (s, ...ss) {
  // Allow the signals to be given as an array.
  if (ss.length === 1 && Array.isArray(ss[0])) {
    ss = ss[0]
  }

  return switchLatest(s.map(a => ss[a]))
}
