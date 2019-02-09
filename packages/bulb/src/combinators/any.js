import Signal from '../Signal'

export default function any (p, s) {
  return new Signal(emit => {
    let result = false

    const subscription = s.subscribe({ ...emit,
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
  })
}
