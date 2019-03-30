# `nodejs-support`
This package contains various building blocks for use in Node.js-based applications.

## `entities`

Usage example:
```javascript
const DayOfWeek = require('@scispike/nodejs-support').entities.DayOfWeek
// ...use DayOfWeek.SUNDAY, etc
```

This folder contains
* convenient enumerations using a pattern that builds on [`enumify`](https://www.npmjs.com/package/enumify),
* fundamental traits based on [`mutrait`](https://www.npmjs.com/package/mutrait) meant to be used by other `class`es,
* fundamental `class`es that may be convenient in other parts of the stack.

See the source for more information.

## `errors`

Usage example:
```javascript
const IllegalArgumentError = require('@scispike/nodejs-support').errors.IllegalArgumentError
throw new IllegalArgumentError('foobar')
```

This folder contains a base error class, `CodedError`, upon which are built many other convenient error classes.
Here is an example of defining your own error classes using `CodedError`:

```javascript
const CodedError = require('@scispike/nodejs-support').errors.CodedError

module.exports = CodedError({ code: 'E_SOMETHING_WICKED_THIS_WAY_COMES' })
```

The `logger` function accepts two parameters:
* `name`: required, the name of your application or module
* `opts`: optional, default `{}`, any [`bunyan`](https://www.npmjs.com/package/bunyan) options you want to set

See the source for more information.

## `logger`

Usage example:
```javascript
// in your own file "index.js" in a directory called "log", "logger" or whatever
const appLogger = require('@scispike/nodejs-support').logger('foobar')
module.exports = appLogger // has methods info, warn, etc
```

This folder exports a function that allows you to easily use [`bunyan`](https://www.npmjs.com/package/bunyan) & [`bunyaner`](https://www.npmjs.com/package/bunyaner) in your own projects.

See the source for more information.

## `require`
Usage example:
```javascript
// in your own index.js file in some directory with lots of things you want to export
const req = require('@scispike/nodejs-support').require
module.exports = req.jsFilesExceptIndexIn(__dirname)
```

This folder exports an object that makes it easy to export an entire directory of artifacts.
Each file or directory in the given directory _as an absolute path_ is added as a key on the returned object.

The methods it offers are the following:
* `dirsIn(dir)`: given an absolute path of directory `dir`, returns an object where each key is the result of `require`ing each child directory of `dir`
* `jsFilesIn(dir)`: given an absolute path of directory `dir`, returns an object where each key is the result of `require`ing each file in `dir` that has a `.js` extension; each key name is the filename without the `.js` extension.
* `jsFilesExceptIndexIn(dir)`: same as `jsFilesIn(dir)`, except that it skips the file `index.js`
* `jsonFilesIn(dir)`: given an absolute path of directory `dir`, returns an object where each key is the result of `require`ing each file in `dir` that has a `.json` extension; each key name is the filename without the `.json` extension.

This module actually eats its own dog food, using this object to export directories and files contained under `src/main`.
See `src/main/index.js` or `src/main/entities/index.js` for examples
