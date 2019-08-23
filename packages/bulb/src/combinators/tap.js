/**
 * Performs the side effect function `f` for each value emitted by the signal
 * `s`.
 *
 * @private
 */
export default function tap (f, s) {
  return emit => {
    const subscription = s.subscribe({
      ...emit,
      next (a) {
        f(a)
        emit.next(a)
      }
    })

    return () => subscription.unsubscribe()
  }
}
