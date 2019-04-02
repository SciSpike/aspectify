'use strict'

const { AfterThrowing } = require('../../../main')

const logError = ({ thisJoinPoint, error }) => {
  console.log(`ERROR: ${thisJoinPoint.fullName} threw ${error}`)
}

module.exports = AfterThrowing(logError)
