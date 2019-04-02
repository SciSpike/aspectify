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

## What's an aspect?
An aspect is composed of two things:  a pointcut & advice.

### What's a pointcut?
A pointcut is the identification of where in your application code you want advice to be applied.
This library's inspiration, AspectJ, includes a complete pointcut expression language that allows you to pick out very precise or very broad points in your application code.
You can think of it as a query language where the data is your code.
Pointcuts result in joinpoints.
Conceptually, a pointcut example in plain English could be "Any method starting with `foo`", or "Any method decorated with `@Bar`".

> NOTE: Since this library is based _exclusively_ on decorators, the only kind of pointcuts supported are those where a particular decorator is being used.
This has the advantage of providing developers visual indications of incoming advice, without having to have an AOP-aware editor.

### What's a joinpoint?
A joinpoint is a particular place in your code as identified by a pointcut.
Continuing the example above, if you have several classes with methods beginning with the string `foo`, each one would be a distinct joinpoint.
Also, if any of your methods are decorated with `@Bar`, each one would be a distinct joinpoint.

### What's advice?
Advice is the code that runs at your selected joinpoints.
It's common for people to use the term "advice" in its plural form, "advices", so get used to that.

#### Advice Types
There are several different advice types.

> TIP: You should use the _least_ powerful advice necessary for your use case.

* `Around`: lets you completely control the advised joinpoint; this is the _most_ powerful form of advice.
* `Before`: invoked before a joinpoint executes; the only way to prevent execution of the advised method is to throw.
* `AfterReturning`: invoked after a joinpoint executes normally.
* `AfterThrowing`: invoked after a joinpoint throws.
* `AfterFinally`: invoked after a joinpoint executes normally or throws.

All advice types in this library take functions that accept a `thisJoinPoint`.
A `thisJoinPoint` is an extension of a `thisJoinPointStaticPart`.

##### `thisJoinPointStaticPart`
A `thisJoinPointStaticPart` represents the information available at static analysis time, before your code executes.
It is an object with the following properties:

* `clazz`: the class (prototype) of the joinpoint, as given by the JavaScript decorator infrastructure.
* `name`: the `name` given by the JavaScript decorator infrastructure; for properties, it is just the property's name.
* `descriptors.original`: the original descriptor as given by the JavaScript decorator infrastructure.
* `descriptors.advised`: the new descriptor returned by the decorator function you are using (which is your chosen advice type).
* `accessor`: `true` if the joinpoint represents a JavaScript accessor (`get` or `set` method).
* `method`: `true` if the joinpoint represents a method or function.

##### `thisJoinPoint`
A `thisJoinPoint` includes everything in a `thisJoinPointStaticPart`, plus:

* `thiz`: the context of the joinpoint; this may be a class instance or just a class if your joinpoint targets a `static` context.
* `fullName`: same as `name`, except when the joinpoint is an accessor, in which case it's `get ...` or `set ...`. 
* `args`: the arguments given at the joinpoint, as an array.
* `get`: equal to `thisJoinPoint.fullName` if the invocation is of the `get` method of the accessor.
* `set`: equal to `thisJoinPoint.fullName` if the invocation is of the `set` method of the accessor.

The last two allow you to easily detect whether the get or set accessor method has been invoked and act accordingly.

#### Around advice
TODO

#### Before advice
TODO

#### AfterReturning advice
TODO

#### AfterThrowing advice
TODO

#### AfterFinally advice
TODO

## Defining Your Own Advice
TODO

### Parameterless Advice
TODO

### Parameterized Advice
TODO

### Synchronous v. Asynchronous Advice
TODO

### Modifying the target class
TODO
