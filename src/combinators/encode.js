import switchLatest from './switchLatest'

/**
 * Switches between the target signals `ts` based on the most recent value
 * emitted by the control signal `s`. The values emitted by the control signal
 * represent the index of the target signal to switch to.
 *
 * @param {Signal} s The control signal.
 * @param {Array} ts The target signals.
 * @returns {Signal} A new signal.
 * @example
 *
 * import { Signal, encode } from 'bulb'
 *
 * const s = Signal.of(1)
 * const t = Signal.of(2)
 * const u = Signal.periodic(1000).sequential([1, 2])
 *
 * encode(u, s, t).subscribe(console.log) // 1, 2
 */
export default function encode (s, ...ts) {
  // Allow the signals to be given as an array.
  if (ts.length === 1 && Array.isArray(ts[0])) {
    ts = ts[0]
  }

  return switchLatest(s.map(a => ts[a]))
}
