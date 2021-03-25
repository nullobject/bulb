export interface Subscription {
  unsubscribe(): void
}

export interface Subscriber<A> {
  next(a: A): void
  error(e: Error): void
  complete(): void
}

export module Signal {
  function of<A>(...as: A[]): Signal<A>
  function empty<A>(): Signal<A>
  function from<A>(iterable: Iterable<A> | ArrayLike<A>): Signal<A>
  function fromCallback<A>(callback: (e: any, a: A) => (() => any)): Signal<A>
  function fromPromise<A>(p: Promise<A>): Signal<A>
  function periodic<A>(n: number): Signal<number>
  function concat<A>(...signals: Signal<A>[]): Signal<A>
  function zip<A, B>(a: Signal<A>, b: Signal<B>): Signal<[A, B]>
  function zip<A, B, C>(a: Signal<A>, b: Signal<B>, c: Signal<C>): Signal<[A, B, C]>
  function zip<A, B, C, D>(a: Signal<A>, b: Signal<B>, c: Signal<C>, d: Signal<D>): Signal<[A, B, C, D]>
  function zipWith<A, B, R>(f: (a: A, b: B) => R, a: Signal<A>, b: Signal<B>): Signal<R>
  function zipWith<A, B, C, R>(f: (a: A, b: B, c: C) => R, a: Signal<A>, b: Signal<B>, c: Signal<C>): Signal<R>
  function zipWith<A, B, C, D, R>(f: (a: A, b: B, c: C, d: D) => R, a: Signal<A>, b: Signal<B>, c: Signal<C>, d: Signal<D>): Signal<R>
  function zipLatest<A, B>(a: Signal<A>, b: Signal<B>): Signal<[A, B]>
  function zipLatest<A, B, C>(a: Signal<A>, b: Signal<B>, c: Signal<C>): Signal<[A, B, C]>
  function zipLatest<A, B, C, D>(a: Signal<A>, b: Signal<B>, c: Signal<C>, d: Signal<D>): Signal<[A, B, C, D]>
  function zipLatestWith<A, B, R>(f: (a: A, b: B) => R, a: Signal<A>, b: Signal<B>): Signal<R>
  function zipLatestWith<A, B, C, R>(f: (a: A, b: B, c: C) => R, a: Signal<A>, b: Signal<B>, c: Signal<C>): Signal<R>
  function zipLatestWith<A, B, C, D, R>(f: (a: A, b: B, c: C, d: D) => R, a: Signal<A>, b: Signal<B>, c: Signal<C>, d: Signal<D>): Signal<R>
}

export class Signal<A> {
  subscribe(f: (a: A) => any): Subscription
  subscribe(subscriber: Subscriber<A>): Subscription

  tap(f: (a: A) => any): Signal<A>

  concat(...signals: Signal<A>[]): Signal<A>
  merge(...signals: Signal<A>[]): Signal<A>
  prepend(...signals: Signal<A>[]): Signal<A>
  append(...signals: Signal<A>[]): Signal<A>
  startWith(a: A): Signal<A>
  endWith(a: A): Signal<A>
  always<B>(b: B): Signal<B>
  cycle<B>(...values: B[]): Signal<B>
  sequential<B>(...values: B[]): Signal<B>

  take(n: number): Signal<A>
  takeUntil(s: Signal<boolean>): Signal<A>
  takeWhile(f: (a: A) => boolean): Signal<A>
  drop(n: number): Signal<A>
  dropUntil(s: Signal<boolean>): Signal<A>
  dropWhile(f: (a: A) => boolean): Signal<A>
  first(): Signal<A>
  last(): Signal<A>

  any(f: (a: A) => boolean): Signal<boolean>
  all(f: (a: A) => boolean): Signal<boolean>

  map<B>(f: (a: A) => B): Signal<B>
  concatMap<B>(f: (a: A) => Signal<B>): Signal<B>
  filter(p: (a: A) => boolean): Signal<A>
  fold<B>(f: (b: B, a: A) => B, b: B): Signal<B>
  scan<B>(f: (b: B, a: A) => B, b: B): Signal<B>
  stateMachine<B, C>(f: (b: B, a: A, subscriber: Subscriber<C>) => B, init?: B): Signal<C>
  zip<B>(b: Signal<B>): Signal<[A, B]>
  zip<B, C>(b: Signal<B>, c: Signal<C>): Signal<[A, B, C]>
  zip<B, C, D>(b: Signal<B>, c: Signal<C>, d: Signal<D>): Signal<[A, B, C, D]>
  zipWith<B, R>(f: (a: A, b: B) => R, b: Signal<B>): Signal<R>
  zipWith<B, C, R>(f: (a: A, b: B, c: C) => R, b: Signal<B>, c: Signal<C>): Signal<R>
  zipWith<B, C, D, R>(f: (a: A, b: B, c: C, d: D) => R, b: Signal<B>, c: Signal<C>, d: Signal<D>): Signal<R>
  zipLatest<B>(b: Signal<B>): Signal<[A, B]>
  zipLatest<B, C>(b: Signal<B>, c: Signal<C>): Signal<[A, B, C]>
  zipLatest<B, C, D>(b: Signal<B>, c: Signal<C>, d: Signal<D>): Signal<[A, B, C, D]>
  zipLatestWith<B, R>(f: (a: A, b: B) => R, b: Signal<B>): Signal<R>
  zipLatestWith<B, C, R>(f: (a: A, b: B, c: C) => R, b: Signal<B>, c: Signal<C>): Signal<R>
  zipLatestWith<B, C, D, R>(f: (a: A, b: B, c: C, d: D) => R, b: Signal<B>, c: Signal<C>, d: Signal<D>): Signal<R>

  delay(n: number): Signal<A>
  debounce(n: number): Signal<A>
  throttle(n: number): Signal<A>
  dedupe(): Signal<A>
  dedupeWith(f: (a: A, b: A) => boolean): Signal<A>
  sample<B>(b: Signal<B>): Signal<A>
  hold<B>(b: Signal<boolean>): Signal<A>
  encode(b: Signal<number>): Signal<A>
  window<B>(b: Signal<B>): Signal<Signal<A>>
  switchLatest(this: Signal<A>): A
  switchMap<B>(f: (a: A) => Signal<B>): Signal<B>
}
