/* global it, describe, beforeEach, before */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const { AsyncAround } = require('../../../main/Advice')

const pause = require('./pause')
const methodDelay = 1
const adviceDelay = methodDelay + 1

class Counter {
  constructor (value = 0) {
    this._value = value
    this.gets = 0
  }

  async increment (step = 1) {
    await pause(methodDelay)
    this._value += step
  }

  async setValue (value) {
    await pause(methodDelay)
    this._value = value
  }

  async getValue () {
    await pause(methodDelay)
    this.gets++
    return this._value
  }
}

class Cache {
  constructor () {
    this._values = {}
  }

  async set (key, value) {
    await pause(methodDelay)
    this._values[key] = value
  }

  async get (key) {
    await pause(methodDelay)
    return this._values[key]
  }

  async has (key) {
    await pause(methodDelay)
    return key in this._values
  }
}

class CacheAdvice {
  constructor () {
    this._cache = new Cache()
    this.advise = this.advise.bind(this)
  }

  async advise ({ thisJoinPoint, value }) {
    await pause(adviceDelay)

    if (thisJoinPoint.set) return thisJoinPoint.proceed()

    if (!(await this._cache.has(thisJoinPoint.fullName))) {
      await this._cache.set(thisJoinPoint.fullName, value || (await thisJoinPoint.proceed()))
    }

    return this._cache.get(thisJoinPoint.fullName)
  }
}

describe('unit tests of asynchronous around advice', function () {
  before(function () {
    expect(adviceDelay).to.be.above(methodDelay)
  })

  describe('Counter', function () {
    it('should work', async function () {
      const counter = new Counter()

      expect(await counter.getValue()).to.equal(0)
      await counter.increment()
      expect(await counter.getValue()).to.equal(1)
      await counter.increment(1)
      expect(await counter.getValue()).to.equal(2)
      await counter.increment(-1)
      expect(await counter.getValue()).to.equal(1)
    })
  })

  describe('parameterless around advice', function () {
    let counter = new Counter()
    let testCounter

    beforeEach(function () {
      const advice = new CacheAdvice()

      const Memoize = AsyncAround(advice.advise)

      class TestCounter extends Counter {
        @Memoize
        async getValue () {
          return super.getValue()
        }
      }

      testCounter = new TestCounter()
    })

    it('should work', async function () {
      expect(await counter.getValue()).to.equal(0)
      await counter.increment()
      expect(await counter.getValue()).to.equal(1)
      await counter.increment(1)
      expect(await counter.getValue()).to.equal(2)

      expect(testCounter.gets).to.equal(0)
      expect(await testCounter.getValue()).to.equal(0)
      expect(testCounter.gets).to.equal(1)

      await testCounter.increment()
      expect(await testCounter.getValue()).to.equal(0)
      expect(testCounter.gets).to.equal(1)

      await testCounter.increment(1)
      expect(await testCounter.getValue()).to.equal(0)
      expect(testCounter.gets).to.equal(1)
    })
  })

  describe('parameterized around advice', async function () {
    let counter = new Counter()
    let testCounter
    let aValue = 42

    beforeEach(function () {
      const advice = new CacheAdvice()

      const JustReturn = value => AsyncAround(async ({ thisJoinPoint }) => advice.advise({ thisJoinPoint, value }))

      class TestCounter extends Counter {
        @JustReturn(aValue)
        async getValue () {
          return super.getValue()
        }
      }

      testCounter = new TestCounter()
    })

    it('should work', async function () {
      expect(await counter.getValue()).to.equal(0)
      await counter.increment()
      expect(await counter.getValue()).to.equal(1)
      await counter.increment(1)
      expect(await counter.getValue()).to.equal(2)

      expect(testCounter.gets).to.equal(0)
      expect(await testCounter.getValue()).to.equal(aValue)
      expect(testCounter.gets).to.equal(0)

      await testCounter.increment()
      expect(await testCounter.getValue()).to.equal(aValue)
      expect(testCounter.gets).to.equal(0)

      await testCounter.increment(1)
      expect(await testCounter.getValue()).to.equal(aValue)
      expect(testCounter.gets).to.equal(0)
    })
  })
})
