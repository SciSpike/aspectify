'use strict'

const LogError = require('./LogError')

class MyClass {
  @LogError
  add (a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('only numbers allowed')
    }
    return a + b
  }
}

module.exports = MyClass
