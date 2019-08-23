/**
 * Emits `true` if *any* of the values emitted by the signal `s` satisfy a
 * predicate function `p`.
 *
 * @private
 */
export default function any (p, s) {
  return emit => {
    let result = false

    const subscription = s.subscribe({
      ...emit,
      next (a) {
        result = result || p(a)
        if (result) { this.complete() }
      },
      complete () {
        emit.next(result)
        emit.complete()
      }
    })

    return () => subscription.unsubscribe()
  }
}
