/**
 * Applies a function `f` to each value emitted by the signal `s`.
 *
 * @private
 */
export default function map (f, s) {
  return emit => {
    let index = 0

    const subscription = s.subscribe({
      ...emit,
      next (a) { emit.next(f(a, index++)) }
    })

    return () => subscription.unsubscribe()
  }
}
