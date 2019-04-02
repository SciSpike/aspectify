/* global it, describe */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const { AsyncBefore } = require('../../../main/Advice')

const pause = require('./pause')

describe('unit tests of asynchronous before advice', function () {
  describe('parameterless before advice', function () {
    it('should work', async function () {
      let count = 0
      const delay = 10
      const val = 1

      const ParameterlessBeforeCount = AsyncBefore(async thisJoinPoint => {
        await pause(delay + 10)
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
      const decoratorDelay = methodDelay + 10
      expect(decoratorDelay).to.be.above(methodDelay)
      const val = 1

      const ParameterizedBeforeCount = (d = 0) => AsyncBefore(async thisJoinPoint => {
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
