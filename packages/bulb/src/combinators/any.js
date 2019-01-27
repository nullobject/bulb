import Signal from '../Signal'

export default function any (p, s) {
  return new Signal(emit => {
    let result = false

    const value = a => {
      result = result || p(a)

      // Bail out if the predicate is satisfied.
      if (result) { complete() }
    }

    const complete = () => {
      emit.value(result)
      emit.complete()
    }

    const subscription = s.subscribe({ ...emit, value, complete })

    return () => subscription.unsubscribe()
  })
}
