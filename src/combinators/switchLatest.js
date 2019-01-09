import { id } from 'fkit'

import { switchMap } from './switchMap'

/**
 * Subscribes to the most recent signal emitted by the signal `s` (a signal
 * that emits other signals). The returned signal will emit values from the
 * most recent signal.
 *
 * @param {Signal} s The higher-order signal.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, switchLatest } from 'bulb'
 *
 * const s = Signal.of(1)
 * const t = Signal.of(2)
 * const u = Signal.periodic(1000).sequential([s, t])
 * const v = switchLatest(u)
 *
 * v.subscribe(console.log) // 1, 2
 */
export default function switchLatest (s) {
  return switchMap(id, s)
}
