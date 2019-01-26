import Signal from '../Signal'

/**
 * Applies a transform function `f` to each value emitted by the signal `s`.
 *
 * @private
 */
export default function stateMachine (f, a, s) {
  return new Signal(emit => {
    const value = b => {
      // Fold the current value with the previous value.
      a = f(a, b, emit)
    }

    const subscription = s.subscribe({ ...emit, value })

    return () => subscription.unsubscribe()
  })
}