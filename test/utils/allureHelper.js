// Helper functions for Allure reporting
let allureInstance = null
let allureChecked = false

/**
 * Get the Allure instance, trying different methods
 */
export const getAllure = () => {
  // Return cached instance if we've already checked
  if (allureChecked) {
    return allureInstance
  }

  try {
    // Method 1: From global scope (when running in allure-jest environment)
    if (global.allure) {
      // Success message is helpful to confirm Allure is working
      console.log('✅ Using Allure from global context')
      allureInstance = global.allure
    }
    // Method 2: Try CommonJS require (more reliable in Jest environment)
    else {
      try {
        const allureJest = require('allure-jest/runtime')
        if (allureJest && allureJest.allure) {
          allureInstance = allureJest.allure
        }
      } catch (requireError) {
        // Method 3: If we can't require it directly, try a dynamic import
        import('allure-jest/runtime')
          .then((module) => {
            if (module && module.allure) {
              allureInstance = module.allure
            }
          })
          .catch(() => {})
      }
    }
  } catch (error) {
    allureInstance = null
  }

  allureChecked = true
  return allureInstance
}

/**
 * Safely execute an Allure method
 */
export const safeAllureCall = (allure, method, ...args) => {
  if (!allure || !allure[method]) {
    return false
  }

  try {
    allure[method](...args)
    return true
  } catch (error) {
    // Silently handle Allure errors
    return false
  }
}

/**
 * Attach data to Allure report
 */
export const attachToAllure = (name, content, type = 'text/plain') => {
  try {
    const allure = getAllure()
    if (!allure || !allure.attachment) {
      return false
    }

    // Convert objects to JSON string
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2)
      type = 'application/json'
    }

    allure.attachment(name, content, type)
    return true
  } catch (error) {
    // Silently handle Allure errors
    return false
  }
}

/**
 * Create an Allure step
 */
export const allureStep = async (name, fn) => {
  const allure = getAllure()
  if (!allure || !allure.step) {
    return await fn()
  }

  try {
    let result
    const stepFn = async () => {
      result = await fn()
      return result
    }

    await allure.step(name, stepFn)
    return result
  } catch (error) {
    console.log(`⚠️ Error in Allure step "${name}": ${error.message}`)
    // If Allure step fails, just run the function
    return await fn()
  }
}

/**
 * Cleanup Allure resources
 */
export const cleanupAllure = async () => {
  try {
    const allure = getAllure()
    if (allure) {
      // Wait for any pending Allure operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100))
      // Reset the instance
      allureInstance = null
      allureChecked = false
    }
  } catch (error) {
    console.error('Error cleaning up Allure:', error)
  }
}

export default {
  getAllure,
  safeAllureCall,
  attachToAllure,
  allureStep,
  cleanupAllure
}
