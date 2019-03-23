## 6.0.0 (2019-03-23)

* Refactor combinators to fix cyclical dependency warnings
* Add dev dependency on Fkit
* Export classes in separate files to help with bundle sizes

## 5.0.0 (2019-02-09)

* Rename `value` -> `next` to match the [observable proposal](https://github.com/tc39/proposal-observable)
* Remove runtime dependency on [Fkit](https://github.com/nullobject/fkit)
* Mark subscriptions as closed when an observer unsubscribes
* Allow `Signal.of` to take multiple arguments
* Don't allow functions which take multiple arguments to an array (use the array spread syntax instead)
* Rename fromArray -> from

## 4.0.1 (2019-02-04)

* Fix peer dependencies for bulb-input

## 4.0.0 (2019-02-04)

* Add `Bus` class

## 3.1.0 (2019-01-27)

* Add `Signal#all` method
* Add `Signal#any` method

## 3.0.2 (2019-01-26)

* Fix issue with array arguments passed to `startWith`, `endWith`, `append`, and `prepend` methods

## 3.0.1 (2019-01-26)

* Add `Signal#startWith` and `Signal#endWith` methods

## 3.0.0 (2019-01-26)

* Remove `Signal.sequential` static method
* Change `Signal.periodic` to emit sequential numbers
* Add `Signal#first` method
* Add `Signal#last` method
* Add index to `map`, `filter`, `fold`, and `scan` methods
* Add `Signal.merge` static method
* Add `Signal.zip` static method
* Add `Signal.zipWith` static method
* Remove combinator functions from exports
* Extract keyboard and mouse signals into `bulb-input` package

## 2.2.0 (2019-01-17)

* Add `apply` function
* Add `Signal.throwError` static method
* Add `catchError` function
* Add `Signal#catchError` method

## 2.1.0 (2019-01-12)

* Add `buffer` function
* Add `Signal#buffer` method

## 2.0.0 (2019-01-12)

* Add `switchMap` function
* Add `Signal#switchMap` method
* Fix an issue where `concatMap` wouldn't wait for signals to complete
* Add missing combinators to exports
* Add `concat` function
* Add `Signal#concat` method
* Add `always` function
* Add `cycle` function
* Add `sequential` function
* Add `prepend` function
* Add `append` function
* Add `Signal#prepend` method
* Add `Signal#append` method
* Fix an issue where exceptions were being swallowed when mounting
* Add `takeUntil` function
* Add `dropUntil` function
* Add `Signal#takeUntil` method
* Add `Signal#dropUntil` method
* Reorder the arguments for `Signal#sample` and `Signal#hold`

## 1.4.0 (2019-01-08)

* Add `Signal#cycle` method
* Add `Signal#sequential` method
* Deprecate `Signal.sequential` method (use `Signal.periodic(1000).sequential([1, 2, 3])` instead)
* Remove `setTimeout` in `Signal.fromArray` method
* Remove `setTimeout` in `scan` function
* Unmount signals when they have completed
* Add `take` function
* Add `takeWhile` function
* Add `drop` function
* Add `dropWhile` function
* Add `Signal#take` method
* Add `Signal#takeWhile` method
* Add `Signal#drop` method
* Add `Signal#dropWhile` method

## 1.3.0 (2019-01-06)

* Rename `emit.next` -> `emit.value`
* Move keyboard and mouse methods to separate functions (e.g. `keyboardKeys`, `keyboardState`, `mouseButtons`, `mousePosition`, and `mouseState`)
* Extract all functions to separate files
* Change to documentation.js for API docs

## 1.2.0 (2018-12-30)

* Switch to jest for tests
* Update readme
* Fix issue where some signals weren't being unmounted properly

## 1.1.1 (2018-01-24)

* Fix issue with initial value scheduling
* Add watch task
* Fix param documentation for curried functions
* Update readme
* Add book search example

## 1.1.0 (2018-01-12)

* Fix an issue with Signal.fromEvent
* Update documentation
* Rename bulb.js -> index.js
* Rename combinator -> combinators

## 1.0.0 (2018-01-02)

* Update rollup to 0.53.2
* Update jsdoc-react to 1.0.0
* Update fkit to 1.1.0
* Update mocha to 4.1.0
* Update documentation
* Refactor keyboard and mouse modules
* Add Signal#throttle and Signal#debounce
* Add throttle function
* Add debounce function
* Curry the combinator functions
* Extract combinators into modules
* Update zipWith function to buffer values
* Rename license to licence
* Remove sampleWith and holdWith functions
* Ensure signal combinators are unsubscribed
* Add Signal#encode
* Add Signal#switch
* Allow Signal#merge to receieve signals as an array
* Update copyright in license
* Don't export default from main module
* Rename observer -> emit
* Refactor subscribe calls to use object reset spread

## 0.4.0 (2017-12-18)

* Fix rollup packaging
* Allow merge to take many arguments
* Refactor stateMachine to take observer argument

## 0.3.2 (2017-12-17)

* Store keyboard state in a set
* Add Signal#startWith function

## 0.3.1 (2017-12-16)

* Don't generate duplicate keyboard events
* Handle no transform function result in Signal#stateMachine

## 0.3.0 (2017-12-16)

* Add Signal#stateMachine function

## 0.2.0 (2017-12-16)

* First cut of the API

## 0.1.0 (2014-11-06)

* Initial import
