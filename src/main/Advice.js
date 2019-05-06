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
const Advice = ({ modify, before, afterReturning, afterThrowing, afterFinally, around, asyncAdvice } = {}) => {
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

    if (modify) {
      modify(thisJoinPointStaticPart)
    }

    const createAdvisedFn = function (originalFn, asynchronous = false) {
      const syncFn = function advisedFn (...args) {
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
        thisJoinPoint.static = (!thisJoinPoint.thiz) || (thisJoinPoint?.thiz === thisJoinPoint?.clazz)

        const proceed = ({ thiz = undefined, args: newArgs = undefined } = {}) => originalFn.apply(thiz || this, newArgs || args)

        let returnValue

        if (around) {
          thisJoinPoint.proceed = proceed
          return around({ thisJoinPoint })
        }

        let error

        try {
          if (before) {
            before({ thisJoinPoint })
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

      const asyncFn = async function advisedFn (...args) {
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

        thisJoinPoint.static = (!thisJoinPoint.thiz) || (thisJoinPoint?.thiz === thisJoinPoint?.clazz)

        const proceed = async ({ thiz, args: newArgs } = {}) => originalFn.apply(thiz || this, newArgs || args)

        let returnValue

        if (around) {
          thisJoinPoint.proceed = proceed
          returnValue = await around({ thisJoinPoint })
          return returnValue
        }

        let error

        try {
          if (before) {
            await before({ thisJoinPoint })
          }

          returnValue = await proceed()

          if (afterReturning) {
            await afterReturning({ returnValue, thisJoinPoint })
          }

          return returnValue
        } catch (e) {
          error = e
          if (afterThrowing) {
            await afterThrowing({ error, thisJoinPoint })
          }
          throw error
        } finally {
          if (afterFinally) {
            await afterFinally({ returnValue, error, thisJoinPoint })
          }
        }
      }

      return asynchronous ? asyncFn : syncFn
    }

    if (value) {
      advisedDescriptor.value = createAdvisedFn(value, asyncAdvice)
    } else {
      if (get) advisedDescriptor.get = createAdvisedFn(get, asyncAdvice)
      if (set) advisedDescriptor.set = createAdvisedFn(set, asyncAdvice)
    }

    return advisedDescriptor
  }
}

const Around = (advice, modify) => Advice({ around: advice, modify })

const Before = (advice, modify) => Advice({ before: advice, modify })

const AfterReturning = (advice, modify) => Advice({ afterReturning: advice, modify })

const AfterThrowing = (advice, modify) => Advice({ afterThrowing: advice, modify })

const AfterFinally = (advice, modify) => Advice({ afterFinally: advice, modify })

const AsyncAround = (advice, modify) => Advice({ around: advice, modify, asyncAdvice: true })

const AsyncBefore = (advice, modify) => Advice({ before: advice, modify, asyncAdvice: true })

const AsyncAfterReturning = (advice, modify) => Advice({ afterReturning: advice, modify, asyncAdvice: true })

const AsyncAfterThrowing = (advice, modify) => Advice({ afterThrowing: advice, modify, asyncAdvice: true })

const AsyncAfterFinally = (advice, modify) => Advice({ afterFinally: advice, modify, asyncAdvice: true })

module.exports = {
  Around,
  Before,
  AfterReturning,
  AfterThrowing,
  AfterFinally,
  AsyncAround,
  AsyncBefore,
  AsyncAfterReturning,
  AsyncAfterThrowing,
  AsyncAfterFinally
}
