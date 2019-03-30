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
    if (get || set) thisJoinPointStaticPart.property = true
    if (value) thisJoinPointStaticPart.method = true

    if (modify) {
      modify(thisJoinPointStaticPart)
    }

    const createAdvisedFn = function (originalFn) {
      return function advisedFn (...args) {
        const thisJoinPoint = {
          thiz: this,
          args,
          ...thisJoinPointStaticPart
        }
        if (thisJoinPointStaticPart.property) {
          if (args.length === 0) thisJoinPoint.get = true
          if (args.length === 1) thisJoinPoint.set = true
        }

        const proceed = ({ thiz, args: newArgs } = {}) => originalFn.apply(thiz || this, newArgs || args)

        if (around) {
          return around({ proceed, thisJoinPoint })
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

const Around = (advice, modify) => Advice({ modify, around: advice })

const Before = (advice, modify) => Advice({ modify, before: advice })

const AfterReturning = (advice, modify) => Advice({ modify, afterReturning: advice })

const AfterThrowing = (advice, modify) => Advice({ modify, afterThrowing: advice })

const AfterFinally = (advice, modify) => Advice({ modify, afterFinally: advice })

module.exports = {
  Around,
  Before,
  AfterReturning,
  AfterThrowing,
  AfterFinally
}
