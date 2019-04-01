/* global it, describe */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const { Before } = require('../../../main/Advice')

const pause = require('./pause')

class Class {
  async go (delayMillis, value) {
    await pause(delayMillis)
    return value
  }
}

describe('unit tests of asynchronous before advice', function () {
  describe('base Class', function () {
    it('should work', async function () {
      const c = new Class()
      const v = await c.go(10, 1)
      expect(v).to.equal(1)
    })

    it('subclass should work', async function () {
      class Subclass extends Class {
        async go (d, v) {
          return super.go(d, v)
        }
      }
      const c = new Subclass()
      const v = await c.go(10, 1)
      expect(v).to.equal(1)
    })
  })

  describe('parameterless before advice', function () {
    it('should work', async function () {
      let count = 0
      const delay = 10
      const val = 1

      const ParameterlessBeforeCount = Before(async thisJoinPoint => {
        await pause(delay + 100)
        count++
      })

      class Class {
        @ParameterlessBeforeCount
        async go (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
      }

      const c = new Class()
      const v = await c.go(delay, val)
      expect(count).to.equal(1)
      expect(v).to.equal(val)
    })
  })

  describe('parameterized before advice', function () {
    it('should work', async function () {
      let count = 0
      const methodDelay = 10
      const decoratorDelay = 100
      expect(decoratorDelay).to.be.above(methodDelay)
      const val = 1

      const ParameterizedBeforeCount = (d = 0) => Before(async thisJoinPoint => {
        await pause(d)
        count++
      })

      class Class {
        @ParameterizedBeforeCount(decoratorDelay)
        async go (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
      }

      const c = new Class()
      const v = await c.go(methodDelay, val)
      expect(count).to.equal(1)
      expect(v).to.equal(val)
    })
  })
})
