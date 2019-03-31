/* global it, describe */
'use strict'

const chai = require('chai')
const expect = chai.expect
chai.use(require('dirty-chai'))

const { Before } = require('../../../main/Advice')

const counts = {}

const Count = step => {
  return Before(thisJoinPoint => {
    let name = thisJoinPoint.name
    if (thisJoinPoint.set) name = 'set ' + name
    if (thisJoinPoint.get) name = 'get ' + name
    counts[name] = (counts[name] || (counts[name] = 0)) + step
  })
}

class Class {
  @Count(1)
  static aStaticMethod () {}

  @Count(3)
  anInstanceMethod () {}

  @Count(5)
  get aProperty () { return this._aProperty }

  set aProperty (value) { this._aProperty = value }
}

describe('before advice', function () {
  it('should work', function () {
    Class.aStaticMethod()
    expect(counts['aStaticMethod']).to.equal(1)

    const it = new Class()
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
