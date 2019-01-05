<h1 align="center"><img alt="Bulb" src="https://raw.githubusercontent.com/nullobject/bulb/master/logo.png" width="200px" /></h1>

[![Build Status](https://travis-ci.org/nullobject/bulb.svg?branch=master)](https://travis-ci.org/nullobject/bulb)

Bulb is a [reactive
programming](https://en.wikipedia.org/wiki/Reactive_programming) library for
JavaScript. It provides a simple API for writing event-based programs in a
declarative style.

The main data structure introduced by Bulb is called a *signal*. A signal
represents a time-varying source of values &mdash; for example, the value of a
text input, a periodic timer, or even the position of the mouse pointer in the
browser window.

The Bulb API provides many functions for creating signals from existing sources
(e.g. AJAX requests, DOM events, timers, etc.) and for performing operations on
signals.

A number of libraries already exist for reactive programming in JavaScript
(e.g. RxJS, Bacon.js, Most.js), but Bulb differs in that it tries to avoid
providing a "kitchen sink". Instead, Bulb defines a very focussed API which
provides only the key building blocks for reactive programming in JavaScript.

Features:

* Simple, focused API. Bigger isn't always better.

* It's small, roughly 4 KB when minified and gzipped!

## Table of Contents

* [Getting Started](#getting-started)
  * [CDN](#cdn)
  * [Node](#node)
* [Documentation](#documentation)
* [Examples](#examples)
* [Licence](#licence)

## Getting Started

### CDN

The quickest and easiest way to start using Bulb is to include a reference to
the minified file in the head of your HTML file.

You can always grab the latest version with:

```html
<script src="https://unpkg.com/bulb/dist/bulb.min.js"></script>
```

You can also use a specific version with:

```html
<script src="https://unpkg.com/bulb@1.0.0/dist/bulb.min.js"></script>
```

### Node

Install the npm package:

```sh
> npm install bulb
```

Require it in your code:

```js
var bulb = require('bulb')
var s = bulb.Signal.of(1)
```

Or, if you are using [ES6
modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import),
you can import just the bits you want:

```js
import { Signal } from 'bulb'
const s = Signal.of(1)
```

## Documentation

* [API documentation](http://nullobject.github.io/bulb/api.html)
* Article by Josh Bassett: [Bulb: A Reactive Programming Library for JavaScript](https://joshbassett.info/2018/bulb/)

## Examples

* [Timer](https://codepen.io/nullobject/pen/wpjQoM)
* [Mouse Position](https://codepen.io/nullobject/pen/eyGQdY)
* [Keyboard State](https://codepen.io/nullobject/pen/qpYoMw)
* [Book Search](https://codepen.io/nullobject/pen/QarojE)
* [Random Numbers](https://codepen.io/nullobject/pen/rpvaeg)
* [PIN Pad](https://codepen.io/nullobject/pen/jYxzda)

## Licence

Bulb is licensed under the MIT licence. See the
[LICENCE](https://github.com/nullobject/bulb/blob/master/LICENCE.md) file for
more details.
