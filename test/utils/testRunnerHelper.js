import {
  getAllure,
  attachToAllure,
  allureStep,
  safeAllureCall,
  cleanupAllure
} from './allureHelper.js'
import { readCsv } from './csvReader.js'

// Constants
const VERBOSE = process.env.VERBOSE === 'true' || false

/**
 * Main test runner that processes test cases from a CSV file
 * @param {string} dataFile - Path to the CSV data file
 * @param {Function} testFunction - The test function to execute for each test case
 * @param {Object} options - Test runner options
 * @returns {Promise<Array>} - Results from all tests
 */
export const runAllTests = async (dataFile, testFunction, options = {}) => {
  const results = []
  let testCases = []
  let failures = 0

  // Default options
  const testOptions = {
    verbose: VERBOSE,
    stopOnError: false,
    allureReport: true,
    ...options
  }

  // Get Allure instance using our helper
  const allure = getAllure()

  try {
    // Read test data from CSV file using the csvReader utility
    testCases = await readCsv(dataFile)

    if (testCases.length === 0) {
      throw new Error(`No test cases found in ${dataFile}`)
    }

    // Add description to Allure report if available
    if (allure && testOptions.allureReport) {
      safeAllureCall(
        allure,
        'description',
        `Running ${testCases.length} test cases from ${dataFile}`
      )
    }

    // Process each test case
    for (const [index, testCase] of testCases.entries()) {
      const testId = testCase.TestDescription || `Case-${index + 1}`

      try {
        if (testOptions.verbose) {
          console.log(`\nRunning test case: ${testId}`)
        }

        // Execute the test function within an Allure step if available
        let result

        if (allure && testOptions.allureReport) {
          result = await allureStep(
            `Test case: ${testId}`,
            async () => await testFunction(testCase, testOptions)
          )
        } else {
          result = await testFunction(testCase, testOptions)
        }

        // Store successful result
        results.push({
          testId,
          success: true,
          response: result
        })

        if (testOptions.verbose) {
          console.log(`✅ Test case: ${testId} passed`)
        }
      } catch (error) {
        failures++

        // Store failed result
        results.push({
          testId,
          success: false,
          error: error.message || 'Unknown error'
        })

        // Log error
        console.error(`❌ Test case: ${testId} failed: ${error.message}`)

        // Attach error to Allure if available
        if (allure && testOptions.allureReport) {
          attachToAllure(`Error in test: ${testId}`, { error: error.message })
          // Mark the Allure test as failed
          safeAllureCall(allure, 'status', 'failed')
        }

        // Stop if requested
        if (testOptions.stopOnError) {
          throw new Error(
            `Test execution stopped after failure in test case: ${testId}`
          )
        }
      }
    }
  } catch (error) {
    // Handle critical errors
    console.error(`⛔ Error running tests: ${error.message}`)

    // Report critical error to Allure
    if (allure && testOptions.allureReport) {
      attachToAllure('Critical error', {
        error: error.message,
        stack: error.stack
      })
      safeAllureCall(allure, 'status', 'failed')
    }

    throw error
  } finally {
    // Generate summary
    const summary = {
      total: testCases.length,
      passed: testCases.length - failures,
      failed: failures
    }

    // Keep the summary logs as they provide valuable test result information
    console.log('\n📊 Test Summary:')
    console.log(`Total: ${summary.total}`)
    console.log(`Passed: ${summary.passed}`)
    console.log(`Failed: ${summary.failed}`)

    // Attach summary to Allure
    if (allure && testOptions.allureReport) {
      attachToAllure('Test Summary', summary)

      // Set Allure status based on test results
      if (failures === 0) {
        safeAllureCall(allure, 'status', 'passed')
      } else {
        safeAllureCall(allure, 'status', 'failed')
      }
    }
    // Clean up Allure resources
    await cleanupAllure()
  }
  return results
}

/**
 * Generic response validator that adapts to different test case structures
 * @param {Object} response - The API response object
 * @param {Object} testCase - Expected values from test case
 * @param {Object} options - Optional validation configuration
 */
export const validateResponse = (response, testCase, options = {}) => {
  // Get allure instance using our helper
  const allure = getAllure()

  const validationOptions = {
    validateStatusCode: true,
    validateContentType: true,
    validateMessage: true,
    validateBody: true,
    customValidators: [],
    allureReport: true,
    throwOnError: true, // By default, throw errors to fail the test
    ...options
  }

  // Attach response to Allure if available
  if (allure && validationOptions.allureReport) {
    attachToAllure('API Response', response.body)
  }

  // Store any validation errors
  const validationErrors = []

  // Define validation steps that might be run inside Allure steps
  const validateStatusCodeFn = () => {
    if (validationOptions.validateStatusCode && testCase.expectedStatusCode) {
      const expectedStatus = Number(testCase.expectedStatusCode)
      if (response.status !== expectedStatus) {
        throw new Error(
          `Expected status ${expectedStatus} but got ${response.status}`
        )
      }
    }
  }

  const validateContentTypeFn = () => {
    if (validationOptions.validateContentType && testCase.expectedContentType) {
      const expectedContentType = testCase.expectedContentType
      const actualContentType = response.headers['content-type']

      if (
        !actualContentType ||
        !actualContentType.includes(expectedContentType)
      ) {
        throw new Error(
          `Expected content-type to include '${expectedContentType}' but got '${actualContentType}'`
        )
      }
    } else if (
      validationOptions.validateContentType &&
      response.status >= 200 &&
      response.status < 300 &&
      !testCase.skipContentTypeCheck
    ) {
      // Default content type check for success responses
      const contentType = response.headers['content-type']
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          `Expected content-type to include 'application/json' but got '${contentType}'`
        )
      }
    }
  }

  const validateMessageFn = () => {
    if (validationOptions.validateMessage && testCase.expectedMessage) {
      if (
        !response.body ||
        response.body.message !== testCase.expectedMessage
      ) {
        throw new Error(
          `Expected message '${testCase.expectedMessage}' but got '${response.body?.message}'`
        )
      }
    }
  }

  const validateBodyFn = () => {
    if (validationOptions.validateBody && testCase.expectedBody) {
      try {
        const expectedBody =
          typeof testCase.expectedBody === 'string'
            ? JSON.parse(testCase.expectedBody)
            : testCase.expectedBody

        // Recursively validate nested properties
        validateObjectProperties(response.body, expectedBody)
      } catch (error) {
        throw new Error(`Body validation failed: ${error.message}`)
      }
    }

    // API-specific validations (for backwards compatibility)
    if (
      validationOptions.validateBody &&
      testCase.sheetId &&
      testCase.parcelId &&
      response.status === 200
    ) {
      // Parcel-specific validation
      if (!response.body.parcel) {
        throw new Error('Response does not contain parcel data')
      }

      if (response.body.parcel.sheetId !== testCase.sheetId) {
        throw new Error(
          `Expected sheetId '${testCase.sheetId}' but got '${response.body.parcel.sheetId}'`
        )
      }

      if (response.body.parcel.parcelId !== testCase.parcelId) {
        throw new Error(
          `Expected parcelId '${testCase.parcelId}' but got '${response.body.parcel.parcelId}'`
        )
      }
    }
  }

  const runCustomValidatorsFn = () => {
    // Run any custom validators
    for (const validator of validationOptions.customValidators) {
      validator(response, testCase)
    }
  }

  // Wrapper function to run validation and collect errors
  const runValidation = (validationFn, name) => {
    try {
      validationFn()
    } catch (error) {
      validationErrors.push(`[${name}] ${error.message}`)
      if (allure && validationOptions.allureReport) {
        attachToAllure(`Error in ${name}`, error.message)
      }
    }
  }

  // Run all validation steps, either with or without allure
  if (allure && validationOptions.allureReport) {
    // With Allure, use steps
    allureStep('Validate Status Code', () =>
      runValidation(validateStatusCodeFn, 'Status Code')
    )
    allureStep('Validate Content Type', () =>
      runValidation(validateContentTypeFn, 'Content Type')
    )
    allureStep('Validate Message', () =>
      runValidation(validateMessageFn, 'Message')
    )
    allureStep('Validate Response Body', () =>
      runValidation(validateBodyFn, 'Response Body')
    )

    if (validationOptions.customValidators.length > 0) {
      allureStep('Run Custom Validators', () =>
        runValidation(runCustomValidatorsFn, 'Custom Validators')
      )
    }
  } else {
    // Without Allure, run directly
    runValidation(validateStatusCodeFn, 'Status Code')
    runValidation(validateContentTypeFn, 'Content Type')
    runValidation(validateMessageFn, 'Message')
    runValidation(validateBodyFn, 'Response Body')
    runValidation(runCustomValidatorsFn, 'Custom Validators')
  }

  // If we collected any validation errors, throw them
  if (validationErrors.length > 0) {
    const errorMessage = `Validation failed:\n- ${validationErrors.join('\n- ')}`
    console.error(errorMessage)

    if (validationOptions.throwOnError) {
      throw new Error(errorMessage)
    }
  }
}

/**
 * Helper function to recursively validate object properties
 * @param {Object} actual - The actual response body
 * @param {Object} expected - The expected properties
 */
const validateObjectProperties = (actual, expected, path = '') => {
  // Validate all expected properties recursively
  for (const [key, expectedValue] of Object.entries(expected)) {
    const currentPath = path ? `${path}.${key}` : key

    if (actual === undefined || actual === null) {
      throw new Error(`Missing value at ${currentPath}`)
    }

    if (!(key in actual)) {
      throw new Error(`Missing property '${currentPath}'`)
    }

    const actualValue = actual[key]

    if (expectedValue === null || actualValue === null) {
      if (expectedValue !== actualValue) {
        throw new Error(
          `Expected '${currentPath}' to be null but got ${actualValue}`
        )
      }
    } else if (
      typeof expectedValue === 'object' &&
      !Array.isArray(expectedValue)
    ) {
      // Recursively validate nested objects
      validateObjectProperties(actualValue, expectedValue, currentPath)
    } else if (Array.isArray(expectedValue)) {
      // Validate arrays
      if (!Array.isArray(actualValue)) {
        throw new Error(
          `Expected '${currentPath}' to be an array but got ${typeof actualValue}`
        )
      }

      if (expectedValue.length > 0 && actualValue.length > 0) {
        // If we have a non-empty array with an object as first element, validate structure of first item
        if (typeof expectedValue[0] === 'object' && expectedValue[0] !== null) {
          validateObjectProperties(
            actualValue[0],
            expectedValue[0],
            `${currentPath}[0]`
          )
        }
      }
    } else if (actualValue !== expectedValue) {
      // For primitives, do direct comparison
      throw new Error(
        `Expected '${currentPath}' to be '${expectedValue}' but got '${actualValue}'`
      )
    }
  }
}
