'use strict'

/**
 * Returns a decorator that applies advice of any type.
 * @param modify [{function}] Function that takes a `thisJoinPointStaticPart` that can be used to modify the decorated member.
 * @param before [{function}] Function that takes a `thisJointPoint` that runs before execution proceeds.
 * @param afterReturning [{function}] Function that takes a `thisJointPoint` that runs after execution normally completes.
 * @param afterThrowing [{function}] Function that takes a `thisJointPoint` that runs after execution completes with an error.
 * @param afterFinally [{function}] Function that takes a `thisJointPoint` that runs after execution completes via `finally`.
 * @param around [{function}] Function that takes a `thisJointPoint` that leaves it to the developer to control behavior; no other advice functions are called.
 * @return {Function}
 * @private
 */
const Advice = ({ modify, before, afterReturning, afterThrowing, afterFinally, around } = {}) => {
  return (clazz, name, originalDescriptor) => {
    const advisedDescriptor = { ...originalDescriptor }

    let value
    let get
    let set
    if (originalDescriptor.value && typeof originalDescriptor.value === 'function') value = originalDescriptor.value
    if (originalDescriptor.get && typeof originalDescriptor.get === 'function') get = originalDescriptor.get
    if (originalDescriptor.set && typeof originalDescriptor.set === 'function') set = originalDescriptor.set

    const thisJoinPointStaticPart = {
      clazz,
      name,
      descriptors: {
        original: originalDescriptor,
        advised: advisedDescriptor
      }
    }
    if (get || set) thisJoinPointStaticPart.accessor = true
    if (value) thisJoinPointStaticPart.method = true

    if (modify) {
      modify(thisJoinPointStaticPart)
    }

    const createAdvisedFn = function (originalFn) {
      return function advisedFn (...args) {
        const thisJoinPoint = {
          thiz: this,
          args,
          fullName: thisJoinPointStaticPart.name,
          ...thisJoinPointStaticPart
        }
        if (thisJoinPoint.accessor) {
          if (args.length === 0) {
            thisJoinPoint.get = thisJoinPoint.fullName = `get ${thisJoinPoint.name}`
          } else {
            thisJoinPoint.set = thisJoinPoint.fullName = `set ${thisJoinPoint.name}`
          }
        }

        const proceed = ({ thiz, args: newArgs } = {}) => originalFn.apply(thiz || this, newArgs || args)

        if (around) {
          thisJoinPoint.proceed = proceed
          return around(thisJoinPoint)
        }

        let returnValue
        let error

        try {
          if (before) {
            before(thisJoinPoint)
          }

          returnValue = proceed()

          if (afterReturning) {
            afterReturning({ returnValue, thisJoinPoint })
          }

          return returnValue
        } catch (e) {
          error = e
          if (afterThrowing) {
            afterThrowing({ error, thisJoinPoint })
          }
          throw error
        } finally {
          if (afterFinally) {
            afterFinally({ returnValue, error, thisJoinPoint })
          }
        }
      }
    }

    if (value) {
      advisedDescriptor.value = createAdvisedFn(value)
    } else {
      if (get) advisedDescriptor.get = createAdvisedFn(get)
      if (set) advisedDescriptor.set = createAdvisedFn(set)
    }

    return advisedDescriptor
  }
}

const Around = (advice, modify) => Advice({ around: advice, modify })

const Before = (advice, modify) => Advice({ before: advice, modify })

const AfterReturning = (advice, modify) => Advice({ afterReturning: advice, modify })

const AfterThrowing = (advice, modify) => Advice({ afterThrowing: advice, modify })

const AfterFinally = (advice, modify) => Advice({ afterFinally: advice, modify })

module.exports = {
  Around,
  Before,
  AfterReturning,
  AfterThrowing,
  AfterFinally
}
