# Bulb

[![Build Status](https://travis-ci.org/nullobject/bulb.svg?branch=master)](https://travis-ci.org/nullobject/bulb)

Bulb is a functional reactive programming (FRP) library for JavaScript.

## Table of Contents

* [Getting Started](#getting-started)
  * [CDN](#cdn)
  * [Node](#node)
* [Documentation](#documentation)
* [Contribute](#contribute)
  * [Build](#build)
  * [Test](#test)
  * [Release](#release)
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
import {Signal} from 'bulb'
const s = Signal.of(1)
```

## Documentation

* [API documentation](http://nullobject.github.io/bulb/api.html)

## Contribute

### Build

Build the library:

```sh
> make dist
```

### Test

Run the tests:

```sh
> make test
```

### Release

Ship a new release x.y.z:

```sh
> make release version=x.y.z
```

## Licence

Bulb is licensed under the MIT licence. See the
[LICENCE](https://github.com/nullobject/bulb/blob/master/LICENCE.md) file for
more details.
