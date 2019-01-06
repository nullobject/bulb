import switchLatest from './switchLatest'

/**
 * Switches between the array of target signals `ts` based on the last control
 * signal value. The values emitted by the control signal `s` represent the
 * index of the signal to switch to.
 *
 * @param {Signal} s The control signal.
 * @param {Array} ts The array of target signals.
 * @returns {Signal} A new signal.
 * @example
 *
 * const s = Signal.periodic(1000).sequential([1, 2, 3])
 * const t = Signal.periodic(1000).always('a')
 * const u = Signal.periodic(1000).always('b')
 * const v = Signal.periodic(1000).always('c')
 *
 * // A signal that switches between the target signals.
 * // e.g. 'a', 'b', 'c'
 * encode(s, t, u, v)
 */
export default function encode (s, ...ts) {
  // Allow the signals to be given as an array.
  if (ts.length === 1 && Array.isArray(ts[0])) {
    ts = ts[0]
  }

  return switchLatest(s.map(a => ts[a]))
}
