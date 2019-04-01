'use strict'

const pause = async (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms))

module.exports = pause
