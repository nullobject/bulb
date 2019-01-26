import Signal from '../Signal'

/**
 * Applies a function `f` to each value emitted by the signal `s`.
 *
 * @private
 */
export default function map (f, s) {
  return new Signal(emit => {
    let index = 0
    const value = a => emit.value(f(a, index++))
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}
