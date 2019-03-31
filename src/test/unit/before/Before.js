/* global it, describe, beforeEach */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const { Before } = require('../../../main/Advice')

// const pause = async (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms))

let counts = {}

const count = (thisJoinPoint, step) => {
  let name = thisJoinPoint.name
  if (thisJoinPoint.set) name = 'set ' + name
  if (thisJoinPoint.get) name = 'get ' + name
  counts[name] = (counts[name] || (counts[name] = 0)) + step
}

const ParameterlessCount = Before(thisJoinPoint => count(thisJoinPoint, 1))

const ParameterizedCount = (step = 1) => {
  return Before(thisJoinPoint => count(thisJoinPoint, step))
}

class ClassUsingParameterlessBefore {
  @ParameterlessCount
  static aStaticMethod () {}

  @ParameterlessCount
  anInstanceMethod () {}

  @ParameterlessCount
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }
}

class ClassUsingParameterizedBefore {
  @ParameterizedCount()
  static aStaticMethod () {}

  @ParameterizedCount(3)
  anInstanceMethod () {}

  @ParameterizedCount(5)
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }
}

describe('before advice', function () {
  beforeEach(() => {
    counts = {}
  })

  it('should work using parameterless before advice', function () {
    ClassUsingParameterlessBefore.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(1)

    const it = new ClassUsingParameterlessBefore()
    it.anInstanceMethod()
    expect(counts['anInstanceMethod']).to.equal(1)

    let value = it.aProperty
    expect(counts['get aProperty']).to.equal(1)
    expect(value).not.to.be.ok()

    it.aProperty = 1
    expect(counts['set aProperty']).to.equal(1)
    expect(it._aProperty).to.equal(1)

    value = it.aProperty
    expect(counts['get aProperty']).to.equal(2)
    expect(value).to.equal(1)
  })

  it('should work using parameterized before advice', function () {
    ClassUsingParameterizedBefore.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(1)

    const it = new ClassUsingParameterizedBefore()
    it.anInstanceMethod()
    expect(counts['anInstanceMethod']).to.equal(3)

    let value = it.aProperty
    expect(counts['get aProperty']).to.equal(5)
    expect(value).not.to.be.ok()

    it.aProperty = 1
    expect(counts['set aProperty']).to.equal(5)
    expect(it._aProperty).to.equal(1)

    value = it.aProperty
    expect(counts['get aProperty']).to.equal(10)
    expect(value).to.equal(1)
  })
})
