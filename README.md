<h1 align="center"><img alt="Bulb" src="https://raw.githubusercontent.com/nullobject/bulb/master/logo.png" width="200px" /></h1>

[![Build Status](https://travis-ci.com/nullobject/bulb.svg?branch=master)](https://travis-ci.com/nullobject/bulb)

Bulb is a [reactive
programming](https://en.wikipedia.org/wiki/Reactive_programming) library for
JavaScript. It provides a simple API for writing event-based programs in a
declarative style.

The main data structure introduced by Bulb is called a *signal*. A signal
represents a time-varying source of values &mdash; for example, the value of a
text input, a periodic timer, or the position of the mouse pointer in the
browser window.

The Bulb API provides many functions for creating signals from various sources
(e.g. arrays, timers, AJAX requests, DOM events, etc.) and for modifying
signals using *combinators*.

A number of libraries already exist for reactive programming in JavaScript
(e.g. RxJS, Bacon.js, Most.js), but Bulb differs in that it tries to avoid
providing a "kitchen sink". Instead, Bulb defines a very focussed API that
contains only the key building blocks for reactive programming in JavaScript.

Features:

* Implements the [ECMAScript Observables
  proposal](https://github.com/tc39/proposal-observable).
* Simple, focused API. Bigger isn't always better.
* It's small, roughly 4 KB when minified and gzipped.

## Table of Contents

* [Installation](#installation)
  * [Node](#node)
  * [Browser](#browser)
* [Documentation](#documentation)
  * [What is a Signal?](#what-is-a-signal-traffic_light)
  * [Signals at a Glance](#signals-at-a-glance-eyes)
  * [Combinators](#combinators-revolving_hearts)
  * [The Signal Life Cycle](#the-signal-life-cycle-recycle)
  * [Get on the Bus](#get-on-the-bus-bus)
* [Examples](#examples)
* [Licence](#licence)

## Installation

### Node

Install the npm package:

```sh
> npm install bulb
```

Require it in your code:

```js
import { Signal } from 'bulb'
```

### Browser

The easiest way to start using Bulb in your browser is to include it with a
`<script>` tag in your HTML file:

```html
<script src="https://unpkg.com/bulb/dist/bulb.min.js"></script>
```

## Documentation

* [API documentation](http://bulb.joshbassett.info)
* Article by Josh Bassett: [Bulb: A Reactive Programming Library for JavaScript](https://joshbassett.info/2018/bulb/)

### What is a Signal? :traffic_light:

The term *signal* is borrowed from hardware description languages, which allow
electrical signals to be modelled as they travel through circuits. Much like in
circuits, signals represent a time-varying flow of data – they can be split
apart, joined together, and modified as they travel through a system.

Signals are:

* *Directed*: Data travels through a network of signals in only one direction.
* *Composable*: Signals can be composed together to create new signals.
* *Lazy*: Signals don't do anything until they actually need to (i.e. an
  *observer* has subscribed).

### Signals at a Glance :eyes:

Let's create a simple signal that emits some values and logs them to the
console:

```js
import { Signal } from 'bulb'

const s = Signal.of(1, 2, 3)

s.subscribe({
  next (a) { console.log(a) }
})
```

Here, `Signal.of(1, 2, 3)` creates a new signal which emits some values in
order. At this point, the signal won't actually do anything until an *observer*
subscribes to the signal.

The `subscribe` method subscribes an observer to the signal. This means that
the `next` callback will be called when the signal emits a value. In this case,
it just prints the emitted values to the console.

An observer can also specify other callback types:

* `next`: Called when the signal emits a value.
* `error`: Called when the signal emits an error.
* `complete`: Called when the signal has finished emitting events.

There is also a handy shortcut if you only want to know when the signal emits a
value. In this case, you can just pass a single callback instead of an observer
object:

```js
s.subscribe(a => console.log(a))
```

### Combinators :revolving_hearts:

Let's continue with our signal from the previous example, but use the `map`
combinator to modify the values before they are logged to the console:

```js
import { Signal } from 'bulb'

const s = Signal.of(1, 2, 3)
const t = s.map(a => a + 1)

t.subscribe(console.log) // 2, 3, 4
```

In this example, we created a completely new signal `t`, by mapping a function
over the original signal `s`. When we subscribe to the new signal `t`, the
modified values are printed in the console.

Another useful combinator is `scan`:

```js
import { Signal } from 'bulb'

const s = Signal.of(1, 2, 3)
const t = s.scan((a, b) => a + b, 0)

t.subscribe(console.log) // 0, 1, 3, 6
```

In this example we created a signal `t`, that takes the values emitted by the
signal `s` and emits the running total of the values, starting from zero. The
function `(a, b) => a + b` is called for every value emitted by the signal `s`,
where `a` is the accumulated value, and `b` is the emitted value. Note that the
`scan` combinator will emit the accumulated value for *every* value emitted by
the signal `s`.

Some combinators wait until the signal has completed before they emit a value.
The `fold` combinator is similar to the `scan` combinator, but it differs in
that it doesn't emit intermediate values. The final value will only be emitted
after the signal has completed:

```js
import { Signal } from 'bulb'

const s = Signal.of(1, 2, 3)
const t = s.fold((a, b) => a + b, 0)

t.subscribe(console.log) // 6
```

In this example, we created a signal `t`, that takes the values emitted by the
signal `s` and calculates the total of the emitted values, starting from zero.
The function `(a, b) => a + b` is called for every value emitted by the signal
`s`, where `a` is the accumulated value, and `b` is the emitted value. Note
that the `scan` combinator will only emit the accumulated value once the signal
`s` has completed.

### The Signal Life Cycle :recycle:

As we saw previously, to subscribe an observer to a signal we use the
`subscribe` method. This method returns a subscription handle, which we can use
to unsubscribe from the signal at a later point in time.

This can be useful for dealing with infinite signals (infinite signals are
signals which never complete, they just keep emitting values forever):

```js
import { Signal } from 'bulb'

const s = Signal.periodic(1000)
const subscription = s.subscribe(console.log) // 0, 1, 2, ...

// Some time later...
subscription.unsubscribe()
```

In this example, we called the `periodic` method to create a signal `s` that
emits an increasing number every second. When we subscribe to the signal, we
keep a reference to the returned subscription handle. To stop receiving values
from the signal, we call the `unsubscribe` method on the handle.

### Get on the Bus :bus:

A `Bus` is a special type of signal that can be connected with other signals:

```js
import { Bus, Signal } from 'bulb'

const s = Signal.of(1, 2, 3)
const bus = new Bus()
const subscription = bus.subscribe(console.log)

bus.connect(s)
```

In this example, we created a bus and a signal. We connected the signal `s` to
the bus by calling the `connect` method, which means that any values emitted by
the signal `s` will be re-emitted by the bus.

Sometimes it is useful to manually emit values on a bus:

```js
import { Bus } from 'bulb'

const bus = new Bus()
const subscription = bus.subscribe(console.log)

bus.next(1)
bus.next(2)
bus.next(3)
```

In this example, we created a bus and subscribed it to the console logger. We
then manually emitted some values by calling the `next` method on the bus.

## Examples

Take a look at some examples of how to use Bulb in the real world:

* [React](https://codepen.io/nullobject/pen/LqdERw)
* [Timer](https://codepen.io/nullobject/pen/wpjQoM)
* [Mouse Position](https://codepen.io/nullobject/pen/eyGQdY)
* [Keyboard State](https://codepen.io/nullobject/pen/qpYoMw)
* [Book Search](https://codepen.io/nullobject/pen/QarojE)
* [Random Strings](https://codepen.io/nullobject/pen/rpvaeg)
* [PIN Pad](https://codepen.io/nullobject/pen/jYxzda)

## Licence

Bulb is licensed under the MIT licence. See the
[LICENCE](https://github.com/nullobject/bulb/blob/master/LICENCE.md) file for
more details.
