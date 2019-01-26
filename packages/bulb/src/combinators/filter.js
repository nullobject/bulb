import Signal from '../Signal'

/**
 * Filters the signal `s` by only emitting values that satisfy a predicate
 * function `p`.
 *
 * @private
 */
export default function filter (p, s) {
  return new Signal(emit => {
    let index = 0
    const value = a => { if (p(a, index++)) { emit.value(a) } }
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}
