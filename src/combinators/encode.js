import switchLatest from './switchLatest'

/**
 * Switches between the array of signals `ss` based on the last signal value.
 * The values emitted by the signal `s` represent the index of the signal to
 * switch to.
 *
 * @param {Signal} s A signal.
 * @param {Array} ss An array of signals.
 * @returns {Signal} A new signal.
 */
export default function encode (s, ...ss) {
  // Allow the signals to be given as an array.
  if (ss.length === 1 && Array.isArray(ss[0])) {
    ss = ss[0]
  }

  return switchLatest(s.map(a => ss[a]))
}
