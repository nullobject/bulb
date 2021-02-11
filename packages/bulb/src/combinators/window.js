/**
 * Windows values emitted by the target signal `t` and emits a new signal
 * whenever the control signal `s` emits a value.
 *
 * @private
 */
export default function window (s, t) {
  return emit => {
    let windowEmit
    let innerSubscription

    const closeWindow = () => {
      if (innerSubscription) {
        windowEmit.complete()
        innerSubscription.unsubscribe()
        innerSubscription = null
      }
    }

    const newWindow = () => {
      closeWindow()
      const w = emit => {
        windowEmit = emit
        innerSubscription = t.subscribe(emit)
      }
      emit.next(w)
    }

    const subscriptions = [
      s.subscribe(newWindow),
      t.subscribe({
        complete () {
          closeWindow()
          emit.complete()
        }
      })
    ]

    // Start a new window immediately
    newWindow()

    return () => {
      closeWindow()
      subscriptions.forEach(s => s.unsubscribe())
    }
  }
}
