import { compose } from 'fkit'

import Signal from '../Signal'

/**
 * Applies a function `f` to each value emitted by the signal `s`.
 *
 * @private
 */
export default function map (f, s) {
  return new Signal(emit => {
    const value = compose(emit.value, f)
    const subscription = s.subscribe({ ...emit, value })
    return () => subscription.unsubscribe()
  })
}
