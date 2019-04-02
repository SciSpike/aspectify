/* global it, describe, beforeEach */
'use strict'

const chai = require('chai')
const expect = chai.expect
const fail = expect.fail
chai.use(require('dirty-chai'))

const { Before, AfterReturning, AfterFinally, AfterThrowing } = require('../../../main/Advice')

let counts = {}

const count = (thisJoinPoint, step) => {
  let name = thisJoinPoint.name
  if (thisJoinPoint.set) name = 'set ' + name
  if (thisJoinPoint.get) name = 'get ' + name
  counts[name] = (counts[name] || (counts[name] = 0)) + step
}

const aStaticMethodReturnValue = 10
const anInstanceMethodReturnValue = 13
const aPropertyValue = 15

const returnValues = {
  aStaticMethod: aStaticMethodReturnValue,
  anInstanceMethod: anInstanceMethodReturnValue,
  aProperty: aPropertyValue
}

const anErrorMessage = 'boom'
const testsAfterThrowingMessage = 'pow'

const ParameterlessBeforeCount = Before(thisJoinPoint => count(thisJoinPoint, 1))
const ParameterlessAfterReturningCount = AfterReturning(({ returnValue, thisJoinPoint }) => {
  if (!thisJoinPoint.set) expect(returnValue).to.equal(returnValues[thisJoinPoint.name])
  count(thisJoinPoint, 1)
})
const ParameterlessAfterFinallyCount = AfterFinally(({ returnValue, error, thisJoinPoint }) => {
  if (!thisJoinPoint.set) expect(returnValue).to.equal(returnValues[thisJoinPoint.name])
  if (thisJoinPoint.name === 'aThrowingMethod') expect(error?.message).to.equal(anErrorMessage)
  count(thisJoinPoint, 1)
})
const ParameterlessAfterThrowingCount = AfterThrowing(({ error, thisJoinPoint }) => {
  if (thisJoinPoint.name === 'testsAfterThrowing') expect(error?.message).to.equal(testsAfterThrowingMessage)
  count(thisJoinPoint, 1)
})

const ParameterizedBeforeCount = (step = 1) => {
  return Before(thisJoinPoint => count(thisJoinPoint, step))
}
const ParameterizedAfterReturningCount = (step = 1) => {
  return AfterReturning(({ returnValue, thisJoinPoint }) => {
    if (!thisJoinPoint.set) expect(returnValue).to.equal(returnValues[thisJoinPoint.name])
    count(thisJoinPoint, step)
  })
}
const ParameterizedAfterFinallyCount = (step = 1) => {
  return AfterFinally(({ returnValue, error, thisJoinPoint }) => {
    if (!thisJoinPoint.set) expect(returnValue).to.equal(returnValues[thisJoinPoint.name])
    if (thisJoinPoint.name === 'aThrowingMethod') expect(error?.message).to.equal(anErrorMessage)
    count(thisJoinPoint, step)
  })
}
const ParameterizedAfterThrowingCount = (step = 1) => {
  return AfterThrowing(({ error, thisJoinPoint }) => {
    if (thisJoinPoint.name === 'testsAfterThrowing') expect(error?.message).to.equal(testsAfterThrowingMessage)
    count(thisJoinPoint, step)
  })
}

class ClassUsingParameterlessBeforeCount {
  @ParameterlessBeforeCount
  static aStaticMethod () { return aStaticMethodReturnValue }

  @ParameterlessBeforeCount
  anInstanceMethod () { return anInstanceMethodReturnValue }

  @ParameterlessBeforeCount
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }

  @ParameterlessBeforeCount
  aThrowingMethod () { throw new Error(anErrorMessage) }
}

class ClassUsingParameterlessAfterReturningCount {
  @ParameterlessAfterReturningCount
  static aStaticMethod () { return aStaticMethodReturnValue }

  @ParameterlessAfterReturningCount
  anInstanceMethod () { return anInstanceMethodReturnValue }

  @ParameterlessAfterReturningCount
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }

  @ParameterlessAfterReturningCount
  aThrowingMethod () { throw new Error(anErrorMessage) }
}

class ClassUsingParameterlessAfterFinallyCount {
  @ParameterlessAfterFinallyCount
  static aStaticMethod () { return aStaticMethodReturnValue }

  @ParameterlessAfterFinallyCount
  anInstanceMethod () { return anInstanceMethodReturnValue }

  @ParameterlessAfterFinallyCount
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }

  @ParameterlessAfterFinallyCount
  aThrowingMethod () { throw new Error(anErrorMessage) }
}

class ClassUsingParameterlessAfterThrowingCount {
  @ParameterlessAfterThrowingCount
  static aStaticMethod () { return aStaticMethodReturnValue }

  @ParameterlessAfterThrowingCount
  anInstanceMethod () { return anInstanceMethodReturnValue }

  @ParameterlessAfterThrowingCount
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }

  @ParameterlessAfterThrowingCount
  testsAfterThrowing () { throw new Error(testsAfterThrowingMessage) }
}

const aStaticMethodStep = 1
const anInstanceMethodStep = 3
const aPropertyStep = 5
const aThrowingMethodStep = 7
const testsAfterThrowingStep = 9

class ClassUsingParameterizedBeforeCount {
  @ParameterizedBeforeCount()
  static aStaticMethod () { return aStaticMethodReturnValue }

  @ParameterizedBeforeCount(anInstanceMethodStep)
  anInstanceMethod () { return anInstanceMethodReturnValue }

  @ParameterizedBeforeCount(aPropertyStep)
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }

  @ParameterizedBeforeCount(aThrowingMethodStep)
  aThrowingMethod () { throw new Error(anErrorMessage) }
}

class ClassUsingParameterizedAfterReturningCount {
  @ParameterizedAfterReturningCount()
  static aStaticMethod () { return aStaticMethodReturnValue }

  @ParameterizedAfterReturningCount(anInstanceMethodStep)
  anInstanceMethod () { return anInstanceMethodReturnValue }

  @ParameterizedAfterReturningCount(aPropertyStep)
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }

  @ParameterizedAfterReturningCount(aThrowingMethodStep)
  aThrowingMethod () { throw new Error(anErrorMessage) }
}

class ClassUsingParameterizedAfterFinallyCount {
  @ParameterizedAfterFinallyCount()
  static aStaticMethod () { return aStaticMethodReturnValue }

  @ParameterizedAfterFinallyCount(anInstanceMethodStep)
  anInstanceMethod () { return anInstanceMethodReturnValue }

  @ParameterizedAfterFinallyCount(aPropertyStep)
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }

  @ParameterizedAfterFinallyCount(aThrowingMethodStep)
  aThrowingMethod () { throw new Error(anErrorMessage) }
}

class ClassUsingParameterizedAfterThrowingCount {
  @ParameterizedAfterThrowingCount(aStaticMethodStep)
  static aStaticMethod () { return aStaticMethodReturnValue }

  @ParameterizedAfterThrowingCount(anInstanceMethodStep)
  anInstanceMethod () { return anInstanceMethodReturnValue }

  @ParameterizedAfterThrowingCount(aPropertyStep)
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }

  @ParameterizedAfterThrowingCount(testsAfterThrowingStep)
  testsAfterThrowing () { throw new Error(testsAfterThrowingMessage) }
}

describe('unit tests of synchronous advice', function () {
  beforeEach(() => {
    counts = {}
  })

  it('should work using parameterless before advice', function () {
    let rv = ClassUsingParameterlessBeforeCount.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(1)
    expect(rv).to.equal(aStaticMethodReturnValue)

    const it = new ClassUsingParameterlessBeforeCount()
    rv = it.anInstanceMethod()
    expect(counts['anInstanceMethod']).to.equal(1)
    expect(rv).to.equal(anInstanceMethodReturnValue)

    it.aProperty = aPropertyValue
    expect(counts['set aProperty']).to.equal(1)
    expect(it._aProperty).to.equal(aPropertyValue)

    const value = it.aProperty
    expect(counts['get aProperty']).to.equal(1)
    expect(value).to.equal(aPropertyValue)

    try {
      it.aThrowingMethod()
      fail('aThrowingMethod should have thrown')
    } catch (e) {
      expect(e.message).to.equal(anErrorMessage)
    }
    expect(counts['aThrowingMethod']).to.equal(1)
  })

  it('should work using parameterized before advice', function () {
    let rv = ClassUsingParameterizedBeforeCount.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(aStaticMethodStep)
    expect(rv).to.equal(aStaticMethodReturnValue)

    const it = new ClassUsingParameterizedBeforeCount()
    rv = it.anInstanceMethod()
    expect(counts['anInstanceMethod']).to.equal(anInstanceMethodStep)
    expect(rv).to.equal(anInstanceMethodReturnValue)

    it.aProperty = aPropertyValue
    expect(counts['set aProperty']).to.equal(aPropertyStep)
    expect(it._aProperty).to.equal(aPropertyValue)

    const value = it.aProperty
    expect(counts['get aProperty']).to.equal(aPropertyStep)
    expect(value).to.equal(aPropertyValue)

    try {
      it.aThrowingMethod()
      fail('aThrowingMethod should have thrown')
    } catch (e) {
      expect(e.message).to.equal(anErrorMessage)
    }
    expect(counts['aThrowingMethod']).to.equal(aThrowingMethodStep)
  })

  it('should work using parameterless afterReturning advice', function () {
    let rv = ClassUsingParameterlessAfterReturningCount.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(1)
    expect(rv).to.equal(aStaticMethodReturnValue)

    const it = new ClassUsingParameterlessAfterReturningCount()
    rv = it.anInstanceMethod()
    expect(counts['anInstanceMethod']).to.equal(1)
    expect(rv).to.equal(anInstanceMethodReturnValue)

    it.aProperty = aPropertyValue
    expect(counts['set aProperty']).to.equal(1)
    expect(it._aProperty).to.equal(aPropertyValue)

    const value = it.aProperty
    expect(counts['get aProperty']).to.equal(1)
    expect(value).to.equal(aPropertyValue)

    try {
      it.aThrowingMethod()
      fail('aThrowingMethod should have thrown')
    } catch (e) {
      expect(e.message).to.equal(anErrorMessage)
    }
    expect(counts['aThrowingMethod']).not.to.be.ok()
  })

  it('should work using parameterized afterReturning advice', function () {
    let rv = ClassUsingParameterizedAfterReturningCount.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(aStaticMethodStep)
    expect(rv).to.equal(aStaticMethodReturnValue)

    const it = new ClassUsingParameterizedAfterReturningCount()
    rv = it.anInstanceMethod()
    expect(counts['anInstanceMethod']).to.equal(anInstanceMethodStep)
    expect(rv).to.equal(anInstanceMethodReturnValue)

    it.aProperty = aPropertyValue
    expect(counts['set aProperty']).to.equal(aPropertyStep)
    expect(it._aProperty).to.equal(aPropertyValue)

    const value = it.aProperty
    expect(counts['get aProperty']).to.equal(aPropertyStep)
    expect(value).to.equal(aPropertyValue)

    try {
      it.aThrowingMethod()
      fail('aThrowingMethod should have thrown')
    } catch (e) {
      expect(e.message).to.equal(anErrorMessage)
    }
    expect(counts['aThrowingMethod']).not.to.be.ok()
  })

  it('should work using parameterless afterFinally advice', function () {
    let rv = ClassUsingParameterlessAfterFinallyCount.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(1)
    expect(rv).to.equal(aStaticMethodReturnValue)

    const it = new ClassUsingParameterlessAfterFinallyCount()
    rv = it.anInstanceMethod()
    expect(counts['anInstanceMethod']).to.equal(1)
    expect(rv).to.equal(anInstanceMethodReturnValue)

    it.aProperty = aPropertyValue
    expect(counts['set aProperty']).to.equal(1)
    expect(it._aProperty).to.equal(aPropertyValue)

    const value = it.aProperty
    expect(counts['get aProperty']).to.equal(1)
    expect(value).to.equal(aPropertyValue)

    try {
      it.aThrowingMethod()
      fail('aThrowingMethod should have thrown')
    } catch (e) {
      expect(e.message).to.equal(anErrorMessage)
    }
    expect(counts['aThrowingMethod']).to.equal(1)
  })

  it('should work using parameterized afterFinally advice', function () {
    let rv = ClassUsingParameterizedAfterFinallyCount.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(aStaticMethodStep)
    expect(rv).to.equal(aStaticMethodReturnValue)

    const it = new ClassUsingParameterizedAfterFinallyCount()
    rv = it.anInstanceMethod()
    expect(counts['anInstanceMethod']).to.equal(anInstanceMethodStep)
    expect(rv).to.equal(anInstanceMethodReturnValue)

    it.aProperty = aPropertyValue
    expect(counts['set aProperty']).to.equal(aPropertyStep)
    expect(it._aProperty).to.equal(aPropertyValue)

    const value = it.aProperty
    expect(counts['get aProperty']).to.equal(aPropertyStep)
    expect(value).to.equal(aPropertyValue)

    try {
      it.aThrowingMethod()
      fail('aThrowingMethod should have thrown')
    } catch (e) {
      expect(e.message).to.equal(anErrorMessage)
    }
    expect(counts['aThrowingMethod']).to.equal(aThrowingMethodStep)
  })

  it('should work using parameterless afterThrowing advice', function () {
    let rv = ClassUsingParameterlessAfterThrowingCount.aStaticMethod()
    expect(counts['aStaticMethod']).not.to.be.ok()
    expect(rv).to.equal(aStaticMethodReturnValue)

    const it = new ClassUsingParameterlessAfterThrowingCount()
    rv = it.anInstanceMethod()
    expect(counts['anInstanceMethod']).not.to.be.ok()
    expect(rv).to.equal(anInstanceMethodReturnValue)

    it.aProperty = aPropertyValue
    expect(counts['set aProperty']).not.to.be.ok()
    expect(it._aProperty).to.equal(aPropertyValue)

    const value = it.aProperty
    expect(counts['get aProperty']).not.to.be.ok()
    expect(value).to.equal(aPropertyValue)

    try {
      it.testsAfterThrowing()
      fail('testsAfterThrowing should have thrown')
    } catch (e) {
      expect(e.message).to.equal(testsAfterThrowingMessage)
    }
    expect(counts['testsAfterThrowing']).to.equal(1)
  })

  it('should work using parameterized afterThrowing advice', function () {
    let rv = ClassUsingParameterizedAfterThrowingCount.aStaticMethod()
    expect(counts['aStaticMethod']).not.to.be.ok()
    expect(rv).to.equal(aStaticMethodReturnValue)

    const it = new ClassUsingParameterizedAfterThrowingCount()
    rv = it.anInstanceMethod()
    expect(counts['anInstanceMethod']).not.to.be.ok()
    expect(rv).to.equal(anInstanceMethodReturnValue)

    it.aProperty = aPropertyValue
    expect(counts['set aProperty']).not.to.be.ok()
    expect(it._aProperty).to.equal(aPropertyValue)

    const value = it.aProperty
    expect(counts['get aProperty']).not.to.be.ok()
    expect(value).to.equal(aPropertyValue)

    try {
      it.testsAfterThrowing()
      fail('testsAfterThrowing should have thrown')
    } catch (e) {
      expect(e.message).to.equal(testsAfterThrowingMessage)
    }
    expect(counts['testsAfterThrowing']).to.equal(testsAfterThrowingStep)
  })
})
