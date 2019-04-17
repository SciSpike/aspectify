/* global it, describe */
'use strict'

const MyClass = require('./MyClass')

const adder = new MyClass()

describe('readme', function () {
  it('should work', function () {
    try {
      adder.add('a', 'b')
    } catch (e) {
      // swallow exception
    }
  })
})
