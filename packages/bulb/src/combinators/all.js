/**
 * Emits `true` if *all* the values emitted by the signal `s` satisfy a
 * predicate function `p`.
 *
 * @private
 */
export default function all (p, s) {
  return emit => {
    let result = true

    const subscription = s.subscribe({
      ...emit,
      next (a) {
        result = result && p(a)
        if (!result) { this.complete() }
      },
      complete () {
        emit.next(result)
        emit.complete()
      }
    })

    return () => subscription.unsubscribe()
  }
}
