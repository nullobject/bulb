import Signal from '../Signal'

export default function all (p, s) {
  return new Signal(emit => {
    let result = true

    const value = a => {
      result = result && p(a)

      // Bail out if the predicate is unsatisfied.
      if (!result) { complete() }
    }

    const complete = () => {
      emit.value(result)
      emit.complete()
    }

    const subscription = s.subscribe({ ...emit, value, complete })

    return () => subscription.unsubscribe()
  })
}
