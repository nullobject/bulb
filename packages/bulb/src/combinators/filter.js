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

    const subscription = s.subscribe({ ...emit,
      next (a) { if (p(a, index++)) { emit.next(a) } }
    })

    return () => subscription.unsubscribe()
  })
}
