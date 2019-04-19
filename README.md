# `aspectify`
This package contains an implementation of _exclusively decorator-driven_ aspect-oriented programming (AOP).
It's similar in spirit to AspectJ's annotation-driven approach, whereby advised methods carry a visual indicator in the source that there is incoming behavior.
In this way, there is no need for a special, AOP-aware editor for the developer to know when there is incoming advice.

> NOTE: This currently uses Babel 7's `@babel/plugin-proposal-decorators` in `legacy: true` mode, which is compliant with TC39's Stage 1 decorator proposal.
It also uses `@babel/plugin-proposal-class-properties` with setting `loose: true`.
As the decorator proposal matures, this library will have to be updated to support later proposals (stage 2 & later).

> NOTE 2: Until further notice, do _not_ use `retainLines: true` in your Babel configuration, as it breaks Babel transpilation!

As the project takes shape, we'll be adding more to this readme.
In the meantime, see the tests for usage information.

## TL;DR
* Configure Babel (example is for `.babelrc` using Babel 7):

```json
{
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "node": true
          }
        }
      ]
    ],
    "plugins": [
      [
        "@babel/plugin-proposal-decorators",
        {
          "legacy": true
        }
      ],
      [
        "@babel/plugin-proposal-class-properties",
        {
          "loose": true
        }
      ]
    ]
  }
```

* Define your class:

```js
// in file MyClass.js

class MyClass {
  add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('only numbers allowed')
    }
    return a + b
  }
}

module.exports = MyClass
```

* Define some advice:

```js
// in file LogError.js

const { AfterThrowing } = require('@scispike/aspectify')

const logError = ({ thisJoinPoint, error }) => {
  console.log(`ERROR: ${thisJoinPoint.fullName} threw ${error}`)
}

module.exports = AfterThrowing(logError)
```

* Update your class to use your advice:

```js
// in file MyClass.js

const LogError = require('./LogError')

class MyClass {
  @LogError
  add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('only numbers allowed')
    }
    return a + b
  }
}
```

* Use your class:

```js
// in file go.js

const MyClass = require('./MyClass')

const adder = new MyClass()

try {
  adder.add('a', 'b')
} catch (e) {
  // gulp
}

```

```sh
$ node go.js
ERROR: add threw Error: only numbers allowed
```

>NOTE:
If an advised method is synchronous (not `async`), then the advice _must_ also be synchronous.
If an advised method is `async`, the advice may be synchronous _or_ `async`.

## What's an aspect?
An aspect is composed of two things:  a pointcut & advice.

### What's a pointcut?
A pointcut is an expression of those places in your application code you want advice to be applied.
This library's inspiration, AspectJ, includes a complete pointcut expression language that allows you to pick out very precise points in your application code.
You can think of it as a query language where the data is your source code.
Pointcut expressions result in a collection of zero or more joinpoints.
A pointcut example in plain English could be "any method on any class starting with `foo`".

Since this library is based _exclusively_ on decorators, the only kind of pointcuts supported are those where a particular decorator is present.
In other words, you _only_ specify joinpoints explicitly via decorators; in other words, the placement of a decorator on a method is effectively identifying a joinpoint.

While limiting, it also has the advantage of providing developers visual indications of incoming advice, without having to have an AOP-aware editor.

### What's a joinpoint?
A joinpoint is a particular place in your code, as identified by a pointcut.
Continuing the example above, if you have several classes with methods beginning with the string `foo`, each one would be a distinct joinpoint selected by your pointcut expression.

Remember, in this implementation of AOP, the only joinpoints you can pick out are method executions (including property accessors, since those are also methods).

### What's advice?
Advice is simply the code that runs at your joinpoints.
It's common for people to use the term "advice" in its plural form, "advices", so get used to that.

#### Advice Types
There are several different advice types.

>TIP: You should use the _least_ powerful advice necessary for your use case.

* `Around`: lets you completely control the advised joinpoint; this is the _most_ powerful form of advice.
* `Before`: invoked before a joinpoint executes; the only way to prevent execution of the advised method is to throw.
* `AfterReturning`: invoked after a joinpoint executes normally.
* `AfterThrowing`: invoked after a joinpoint throws.
* `AfterFinally`: invoked after a joinpoint executes normally or throws.

All advice types in this library take functions that accept a `thisJoinPoint`.
A `thisJoinPoint` is an extension of a `thisJoinPointStaticPart`.
Their definitions follow.

##### `thisJoinPointStaticPart`
A `thisJoinPointStaticPart` represents the information available at static analysis time, before your code executes.
It is an object with the following properties:

* `clazz`: the class (prototype) of the joinpoint, as given by the JavaScript decorator infrastructure.
* `name`: the `name` given by the JavaScript decorator implementation; for properties, it is just the property's name _without_ the `get ` or `set ` prefix.
* `descriptors.original`: the original [property descriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description) as given by the JavaScript decorator infrastructure.
* `descriptors.advised`: the new [property descriptor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description) returned by the advice type that you're using (`Before`, `AfterReturning`, etc).
* `accessor`: `true` if the joinpoint represents a JavaScript accessor (`get` or `set` method).

##### `thisJoinPoint`
A `thisJoinPoint` includes everything in a `thisJoinPointStaticPart`, plus:

* `thiz`: the context of the joinpoint; it is either the class instance of the joinpoint, or a class if your joinpoint targets a `static` method.
* `fullName`: same as `thisJoinPoint.name`, except when the joinpoint is an accessor, in which case it's `get ${thisJoinPoint.name}` or `set ${thisJoinPoint.name}`.
* `args`: the arguments given to the advised method, as an array.
* `proceed`: a function that is __only present if using `Around` or `AsyncAround` advice__, and provides you the ability to allow execution to proceed into the advised method.
It takes a single object argument with optional keys:
  * `thiz`: a value for the `this` reference in the advised method; defaults to `thisJoinPoint.thiz`.
  * `args`: an array of arguments that the target advised will be called with; defaults to `thisJoinPoint.args`.
* `get`: equal to `thisJoinPoint.fullName` if the invocation is of the `get` method of the accessor.
* `set`: equal to `thisJoinPoint.fullName` if the invocation is of the `set` method of the accessor.

The `thisJoinPoint.get` & `thisJoinPoint.set` allow you to easily detect whether the `get` or `set` accessor method has been invoked; just check the properties' [truthiness](https://developer.mozilla.org/en-US/docs/Glossary/Truthy).

#### Before advice
`Before` advice executes before the target method does.

Advice function signature: `function ({ thisJoinPoint }) {}`

`Before` advice allows you to do things _before_ the target method executes.
The only way to prevent execution of the target method is to throw.

Typical uses of `Before` advice include authorization, validation, deprecation warnings, etc.

#### AfterReturning advice
`AfterReturning` advice executes only after the target method returns normally, that is, without throwing anything.

Advice function signature: `function ({ thisJoinPoint, returnValue }) {}`

`AfterReturning` advice allows you to do things _after_ the target method returns normally.
You cannot replace the return value, only modify it.

>NOTE: If you _must_ replace the return value entirely, use `Around` advice.

Typical uses of `AfterReturning` advice include compliance, data masking, etc.

#### AfterThrowing advice
`AfterThrowing` advice executes only after the target method throws anything, not returning normally.

Advice function signature: `function ({ thisJoinPoint, error }) {}`

`AfterThrowing` advice allows you to do things _after_ the target method has thrown something.
You cannot replace the throwable.

>NOTE: If you _must_ replace the throwable entirely, use `Around` advice.

Typical uses of `AfterThrowing` advice include compliance, error logging, etc.

#### AfterFinally advice
`AfterFinally` advice executes after the target method completes, whether via returning normally or throwing.

Advice function signature: `function ({ thisJoinPoint, returnValue, error }) {}`

Only one of `returnValue` or `error` will be present, depending on whether the target method returned normally or threw, respectively.

`AfterFinally` advice allows you to do things _after_ the target method completes.
You cannot replace the return value or throwable, only modify them.

>NOTE: If you _must_ replace the return value or throwable entirely, use `Around` advice.

Typical uses of `AfterFinally` advice include timings, auditing, etc.

#### Around advice
`Around` advice is the most powerful form of advice, allowing you to completely replace the behavior of the decorated method.

Advice function signature: `function ({ thisJoinPoint }) {}`

In the case of `Around` advice, `thisJoinPoint` will also have a `proceed` function, that allows you to invoke the target method, optionally overriding the method's `this` reference and its arguments.
See the documentation above for `thisJoinPoint` for more information.

>NOTE: The most common error when using `Around` advice is to forget to return the target method's return value after `thisJoinPoint.proceed()`ing.
Remember to return a value if the target method does!

Typical uses of `Around` advice include caching, memoization, transaction management, method timings for service level agreement enforcement, etc.

## Defining Your Own Aspects
Recall that an aspect is fundamentally a pointcut and advice.
In this implementation of AOP, there is no pointcut expression language like in AspectJ.
The joinpoints are simply the methods on which you place your decorators.

Advice is the code that executes at your joinpoint.
Therefore, advice is just a function, as detailed above, that is given to your decorator.

The general idea is that you select the _least_ powerful kind of advice that you need (basically, only use `Around` advice if you absolutely need to).
Then, provide one of `@scispike/aspectify`'s advice types your advice function.

>NOTE: For testability, it's a good idea to separate advice from decorators wherein they're used.
That way, you can test your advice separately from the decorators in which it's used.

There are basically two kinds of aspects:  parameterless & parameterized.

### Parameterless Aspect
Here's an example of a parameterless `Before` aspect that enforces security:
```js
// in aspect file Secured.js

const securityRepo = require('...') // require security repo from wherever you get it
const getUser = require('...') // some function that retrieves the current user from some context

const Secured = Before(
  ({ thisJoinPoint }) => {
    const user = getUser()

    if (thisJoinPoint.set && !securityRepo.grants(user, thisJoinPoint.thiz, thisJoinPoint.clazz, thisJoinPoint.method)) {
     throw new Error(`unauthorized: ${user}, ${thisJoinPoint.clazz}.${thisJoinPoint.method}`)
    }
  }
)
```

To use this aspect, simply decorate the methods that you intend to secure with the `@Secured` decorator:
```js
// in class file Appointment.js

const Secured = require('./Secured')

class Appointment {
  constructor(begin, end, notes) {
    this.begin = begin
    this.end = end
    this.notes = notes
  }
  
  @Secured
  set cancelled (value) {
    this._cancelled = value
  }
  
  get cancelled () {
    return this._cancelled
  }
}
```

>NOTE: When intercepting accessors (that is, `get` & `set` methods of properties), only annotate _one_ of the accessor methods.

Now, by simply using the class normally, unauthorized users will not be able to cancel appointments:
```js
const putUser = require('...') // some function that puts the user into some retrievable context
const appointmentRepo = require('...') // some Appointment repository

putUser('liljohnny')

const appt = await appointmentRepo.findById(123)
appt.cancelled = true // throws Error if the user is not authorized to cancel this appointment
```

>TIP: Use continuation-local storage to put things like users into a context.
As a shameless plug, a good library to try is [`@scispike/nodej-support`](https://www.npmjs.com/package/@scispike/nodejs-support); specifically, `require('@scispike/nodejs-support/context/ClsHookedContext')`.

### Parameterized Aspects
Here's an example of a parameterized `Before` aspect that enforces security:
```js
// in aspect file Secured.js

const securityRepo = require('...') // require security repo from wherever you get it
const getUser = require('...') // some function that retrieves the current user from some context

const Secured = message => Before(
  ({ thisJoinPoint }) => {
    const user = getUser()

    if (thisJoinPoint.set && !securityRepo.grants(user, thisJoinPoint.thiz, thisJoinPoint.clazz, thisJoinPoint.method)) {
     throw new Error(`${message}: ${user}, ${thisJoinPoint.clazz}.${thisJoinPoint.method}`)
    }
  }
)
```

To use this aspect, simply decorate the methods that you intend to secure with the `@Secured` decorator:
```js
// in class file Appointment.js

const Secured = require('./Secured')

class Appointment {
  constructor(begin, end, notes) {
    this.begin = begin
    this.end = end
    this.notes = notes
  }
  
  @Secured('boom')
  set cancelled (value) {
    this._cancelled = value
  }
  
  get cancelled () {
    return this._cancelled
  }
}
```

>NOTE: When intercepting accessors (that is, `get` & `set` methods of properties), only annotate _one_ of the accessor methods.

Now, by simply using the class normally, unauthorized users will not be able to cancel appointments:
```js
const putUser = require('...') // some function that puts the user into some retrievable context
const appointmentRepo = require('...') // some Appointment repository

putUser('liljohnny')

const appt = await appointmentRepo.findById(123)
appt.cancelled = true // throws Error if the user is not authorized to cancel this appointment
```

>TIP: Use continuation-local storage to put things like users into a context.
As a shameless plug, a good library to try is [`@scispike/nodej-support`](https://www.npmjs.com/package/@scispike/nodejs-support); specifically, `require('@scispike/nodejs-support/context/ClsHookedContext')`.

### Synchronous v. Asynchronous Advice
If an advised method is synchronous (not `async`), then the advice _must_ also be synchronous.

If an advised method is `async`, the advice may be synchronous _or_ `async`.

## Tips, Tricks & Best Practices
### Intercepting constructors
Sorry, you currently can't intercept constructor execution, but there _is_ an alternative pattern.
Simply define a static factory method on your class, and intercept _that_:
```js
const Secured = require('./Secured')

class Appointment {
  /**
   * Constructs a new Appointment instance.
   */
  @Secured
  static new (begin, end, notes) {
    return new Appointment(begin, end, notes)
  }
  
  /**
   * @private
   */
  constructor(begin, end, notes) {
    // ...
  }
}
```

### Intercepting property accessors
The current decorator specification behaves in such a way that you can only decorate either the `get` or `set` method, not both.
This implementation provides as much information as possible at design time and runtime for you to be able to detect which accessor was decorated and called, respectively.

At design time, `thisJoinPointStaticPart.accessor` is truthy if the decorated method is an accessor.

At runtime, if `thisJoinPoint.set` is truthy, then the `set` accessor was called and `thisJoinPoint.fullName` starts with `set `, and if `thisJoinPoint.get` is truthy, then the `get` accessor was called and `thisJoinPoint.fullName` starts with `get `.

## Modifying the target class
>NOTE: this is an advanced topic.

This implementation also provides aspect authors the ability to modify the target class.
Each advice type accepts an optional second argument that is a function that is given a `thisJoinPointStaticPart`, with which you can use to do any metaprogramming you need to.
In particular, the prototype of the target class is available at `thisJoinPointStaticPart.clazz`.
You can use that to modify whatever you'd like to.