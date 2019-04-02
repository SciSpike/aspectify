/* global it, describe, before */
'use strict'

const chai = require('chai')
const expect = chai.expect
const fail = expect.fail
chai.use(require('dirty-chai'))

const { AsyncBefore, AsyncAfterReturning, AsyncAfterThrowing, AsyncAfterFinally } = require('../../../main/Advice')

const pause = require('./pause')

const assertThisJoinPoint = thisJoinPoint => {
  expect(thisJoinPoint).to.be.ok()
  expect(thisJoinPoint.clazz).to.be.ok()
  expect(thisJoinPoint.name).to.be.ok()
  expect(thisJoinPoint.descriptors).to.be.ok()
  expect(thisJoinPoint.descriptors.original).to.be.ok()
  expect(thisJoinPoint.descriptors.advised).to.be.ok()
  expect(thisJoinPoint.thiz).to.be.ok()
  expect(thisJoinPoint.args).to.be.ok()
  expect(thisJoinPoint.fullName).to.be.ok()
}

describe('unit tests of asynchronous', function () {
  const methodDelay = 1
  const adviceDelay = methodDelay + 5
  const val = 1
  const err = 'boom'

  before(function () {
    expect(adviceDelay).to.be.above(methodDelay)
  })

  describe('parameterless advice', function () {
    it('should work with AsyncBefore', async function () {
      let count = 0

      const ParameterlessBeforeCount = AsyncBefore(async ({ thisJoinPoint }) => {
        assertThisJoinPoint(thisJoinPoint)
        await pause(adviceDelay)
        count++
      })

      class Class {
        @ParameterlessBeforeCount
        async doesNotThrow (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
        @ParameterlessBeforeCount
        async doesThrow (delayMillis, value) {
          await pause(delayMillis)
          throw new Error(err)
        }
      }

      const c = new Class()
      const v = await c.doesNotThrow(methodDelay, val)
      expect(count).to.equal(1)
      expect(v).to.equal(val)

      try {
        await c.doesThrow(methodDelay, val)
        fail('c.doesThrow() should have thrown')
      } catch (e) {
        expect(count).to.equal(2)
        expect(e.message).to.equal(err)
      }
    })

    it('should work with AsyncAfterReturning', async function () {
      let count = 0

      const ParameterlessAfterReturningCount = AsyncAfterReturning(async function ({ thisJoinPoint, returnValue }) {
        assertThisJoinPoint(thisJoinPoint)
        expect('returnValue' in arguments[0])
        await pause(adviceDelay)
        count++
      })

      class Class {
        @ParameterlessAfterReturningCount
        async doesNotThrow (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
        @ParameterlessAfterReturningCount
        async doesThrow (delayMillis, value) {
          await pause(delayMillis)
          throw new Error(err)
        }
      }

      const c = new Class()
      const v = await c.doesNotThrow(methodDelay, val)
      expect(count).to.equal(1)
      expect(v).to.equal(val)

      try {
        await c.doesThrow(methodDelay, val)
        fail('c.doesThrow() should have thrown')
      } catch (e) {
        expect(count).to.equal(1)
        expect(e.message).to.equal(err)
      }
    })

    it('should work with AsyncAfterThrowing', async function () {
      let count = 0

      const ParameterlessAfterThrowingCount = AsyncAfterThrowing(async function ({ thisJoinPoint, error }) {
        assertThisJoinPoint(thisJoinPoint)
        expect('error' in arguments[0])
        await pause(adviceDelay)
        count++
      })

      class Class {
        @ParameterlessAfterThrowingCount
        async doesNotThrow (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
        @ParameterlessAfterThrowingCount
        async doesThrow (delayMillis, value) {
          await pause(delayMillis)
          throw new Error(err)
        }
      }

      const c = new Class()
      const v = await c.doesNotThrow(methodDelay, val)
      expect(count).to.equal(0)
      expect(v).to.equal(val)

      try {
        await c.doesThrow(methodDelay, val)
        fail('c.doesThrow() should have thrown')
      } catch (e) {
        expect(count).to.equal(1)
        expect(e.message).to.equal(err)
      }
    })

    it('should work with AsyncAfterFinally', async function () {
      let count = 0

      const ParameterlessAfterFinallyCount = AsyncAfterFinally(async ({ thisJoinPoint }) => {
        assertThisJoinPoint(thisJoinPoint)
        await pause(adviceDelay)
        count++
      })

      class Class {
        @ParameterlessAfterFinallyCount
        async doesNotThrow (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
        @ParameterlessAfterFinallyCount
        async doesThrow (delayMillis, value) {
          await pause(delayMillis)
          throw new Error(err)
        }
      }

      const c = new Class()
      const v = await c.doesNotThrow(methodDelay, val)
      expect(count).to.equal(1)
      expect(v).to.equal(val)

      try {
        await c.doesThrow(methodDelay, val)
        fail('c.doesThrow() should have thrown')
      } catch (e) {
        expect(count).to.equal(2)
        expect(e.message).to.equal(err)
      }
    })
  })

  describe('parameterized', function () {
    it('should work with AsyncBefore advice', async function () {
      let count = 0

      const ParameterizedBeforeCount = (d = 0) => AsyncBefore(async ({ thisJoinPoint }) => {
        assertThisJoinPoint(thisJoinPoint)
        await pause(d)
        count++
      })

      class Class {
        @ParameterizedBeforeCount(adviceDelay)
        async doesNotThrow (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
        @ParameterizedBeforeCount(adviceDelay)
        async doesThrow (delayMillis, value) {
          await pause(delayMillis)
          throw new Error(err)
        }
      }

      const c = new Class()
      const v = await c.doesNotThrow(methodDelay, val)
      expect(count).to.equal(1)
      expect(v).to.equal(val)

      try {
        await c.doesThrow(methodDelay, val)
        fail('c.doesThrow() should have thrown')
      } catch (e) {
        expect(count).to.equal(2)
        expect(e.message).to.equal(err)
      }
    })

    it('should work with AsyncAfterReturning advice', async function () {
      let count = 0

      const ParameterizedAfterReturningCount = (d = 0) => AsyncAfterReturning(async function ({ thisJoinPoint, returnValue }) {
        assertThisJoinPoint(thisJoinPoint)
        expect('returnValue' in arguments[0])
        await pause(d)
        count++
      })

      class Class {
        @ParameterizedAfterReturningCount(adviceDelay)
        async doesNotThrow (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
        @ParameterizedAfterReturningCount(adviceDelay)
        async doesThrow (delayMillis, value) {
          await pause(delayMillis)
          throw new Error(err)
        }
      }

      const c = new Class()
      const v = await c.doesNotThrow(methodDelay, val)
      expect(count).to.equal(1)
      expect(v).to.equal(val)

      try {
        await c.doesThrow(methodDelay, val)
        fail('c.doesThrow() should have thrown')
      } catch (e) {
        expect(count).to.equal(1)
        expect(e.message).to.equal(err)
      }
    })

    it('should work with AsyncAfterThrowing advice', async function () {
      let count = 0

      const ParameterizedAfterThrowingCount = (d = 0) => AsyncAfterThrowing(async function ({ thisJoinPoint, error }) {
        assertThisJoinPoint(thisJoinPoint)
        expect('error' in arguments[0])
        await pause(d)
        count++
      })

      class Class {
        @ParameterizedAfterThrowingCount(adviceDelay)
        async doesNotThrow (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
        @ParameterizedAfterThrowingCount(adviceDelay)
        async doesThrow (delayMillis, value) {
          await pause(delayMillis)
          throw new Error(err)
        }
      }

      const c = new Class()
      const v = await c.doesNotThrow(methodDelay, val)
      expect(count).to.equal(0)
      expect(v).to.equal(val)

      try {
        await c.doesThrow(methodDelay, val)
        fail('c.doesThrow() should have thrown')
      } catch (e) {
        expect(count).to.equal(1)
        expect(e.message).to.equal(err)
      }
    })

    it('should work with AsyncAfterFinally advice', async function () {
      let count = 0

      const ParameterizedAfterFinallyCount = (d = 0) => AsyncAfterFinally(async function ({ thisJoinPoint }) {
        assertThisJoinPoint(thisJoinPoint)
        await pause(d)
        count++
      })

      class Class {
        @ParameterizedAfterFinallyCount(adviceDelay)
        async doesNotThrow (delayMillis, value) {
          await pause(delayMillis)
          return value
        }
        @ParameterizedAfterFinallyCount(adviceDelay)
        async doesThrow (delayMillis, value) {
          await pause(delayMillis)
          throw new Error(err)
        }
      }

      const c = new Class()
      const v = await c.doesNotThrow(methodDelay, val)
      expect(count).to.equal(1)
      expect(v).to.equal(val)

      try {
        await c.doesThrow(methodDelay, val)
        fail('c.doesThrow() should have thrown')
      } catch (e) {
        expect(count).to.equal(2)
        expect(e.message).to.equal(err)
      }
    })
  })
})
