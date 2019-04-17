/* global it, describe, beforeEach */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const { Around } = require('../../../main/Advice')

class Counter {
  constructor (value = 0) {
    this._value = value
    this.gets = 0
  }

  increment (step = 1) {
    this._value += step
  }

  set value (value) {
    this._value = value
  }

  get value () {
    this.gets++
    return this._value
  }
}

class Cache {
  constructor () {
    this._values = {}
  }

  set (key, value) {
    this._values[key] = value
  }

  get (key) {
    return this._values[key]
  }

  has (key) {
    return key in this._values
  }
}

class CacheAdvice {
  constructor () {
    this._cache = new Cache()
    this.advise = this.advise.bind(this)
  }

  advise (thisJoinPoint, value) {
    if (thisJoinPoint.set) return thisJoinPoint.proceed()

    if (!this._cache.has(thisJoinPoint.fullName)) {
      this._cache.set(thisJoinPoint.fullName, value || thisJoinPoint.proceed())
    }

    return this._cache.get(thisJoinPoint.fullName)
  }
}

describe('unit tests of synchronous around advice', function () {
  describe('Counter', function () {
    it('should work', function () {
      const counter = new Counter()

      expect(counter.value).to.equal(0)
      counter.increment()
      expect(counter.value).to.equal(1)
      counter.increment(1)
      expect(counter.value).to.equal(2)
      counter.increment(-1)
      expect(counter.value).to.equal(1)
    })
  })

  describe('parameterless around advice', function () {
    let counter = new Counter()
    let testCounter

    beforeEach(function () {
      const advice = new CacheAdvice()

      const Memoize = Around(advice.advise) // note that advise is bind()'ed!

      class TestCounter extends Counter {
        @Memoize
        get value () {
          return super.value
        }
      }

      testCounter = new TestCounter()
    })

    it('should work', function () {
      expect(counter.value).to.equal(0)
      counter.increment()
      expect(counter.value).to.equal(1)
      counter.increment(1)
      expect(counter.value).to.equal(2)

      expect(testCounter.gets).to.equal(0)
      expect(testCounter.value).to.equal(0)
      expect(testCounter.gets).to.equal(1)

      testCounter.increment()
      expect(testCounter.value).to.equal(0)
      expect(testCounter.gets).to.equal(1)

      testCounter.increment(1)
      expect(testCounter.value).to.equal(0)
      expect(testCounter.gets).to.equal(1)
    })
  })

  describe('parameterized around advice', function () {
    let counter = new Counter()
    let testCounter
    let aValue = 42

    beforeEach(function () {
      const advice = new CacheAdvice()

      const JustReturn = value => Around((thisJoinPoint) => advice.advise(thisJoinPoint, value))

      class TestCounter extends Counter {
        @JustReturn(aValue)
        get value () {
          return super.value
        }
      }

      testCounter = new TestCounter()
    })

    it('should work', function () {
      expect(counter.value).to.equal(0)
      counter.increment()
      expect(counter.value).to.equal(1)
      counter.increment(1)
      expect(counter.value).to.equal(2)

      expect(testCounter.gets).to.equal(0)
      expect(testCounter.value).to.equal(aValue)
      expect(testCounter.gets).to.equal(0)

      testCounter.increment()
      expect(testCounter.value).to.equal(aValue)
      expect(testCounter.gets).to.equal(0)

      testCounter.increment(1)
      expect(testCounter.value).to.equal(aValue)
      expect(testCounter.gets).to.equal(0)
    })
  })
})
