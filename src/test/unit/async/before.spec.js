/* global it, describe */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const { Before } = require('../../../main/Advice')

const pause = require('./pause')

describe('unit tests of asynchronous before advice', function () {
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
})
