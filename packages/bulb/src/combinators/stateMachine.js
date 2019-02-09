import Signal from '../Signal'

/**
 * Applies a transform function `f` to each value emitted by the signal `s`.
 *
 * @private
 */
export default function stateMachine (f, a, s) {
  return new Signal(emit => {
    const subscription = s.subscribe({ ...emit,
      next (b) { a = f(a, b, emit) }
    })

    return () => subscription.unsubscribe()
  })
}
