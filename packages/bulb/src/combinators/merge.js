import Signal from '../Signal'

/**
 * Merges the signals `ss` and emits their values. The returned signal will
 * complete once *all* of the given signals have completed.
 *
 * @private
 */
export default function merge (ss) {
  return new Signal(emit => {
    let n = 0

    const complete = () => {
      if (++n >= ss.length) { emit.complete() }
    }

    const subscriptions = ss.map(s => s.subscribe({ ...emit, complete }))

    return () => subscriptions.forEach(s => s.unsubscribe())
  })
}
