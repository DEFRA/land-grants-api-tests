/**
 * Helper functions for recording and tracking test results
 * @param {string} dataFile - Path to the CSV data file
 * @param {Function} testFunction - Function to execute for each test case
 * @param {Object} options - Test options including runAllTests options
 * @returns {Promise<void>} - Resolves when all tests complete, rejects if any test fails
 */
export const runTestsAndRecordResults = async (
  dataFile,
  testFunction,
  options = {}
) => {
  const { runAllTests } = require('./testRunnerHelper.js')

  // Default test options
  const testOptions = {
    verbose: true,
    allureReport: true,
    stopOnError: false,
    ...options
  }

  // Record the overall test result to make sure it fails properly
  let testFailed = false
  let errorMessage = ''

  try {
    // Run all test cases and check results
    const results = await runAllTests(dataFile, testFunction, testOptions)

    // Explicitly check for failures
    const failedTests = results.filter((r) => !r.success)
    if (failedTests.length > 0) {
      testFailed = true
      const failedIds = failedTests.map((t) => t.testId).join(', ')
      const errors = failedTests
        .map((t) => `${t.testId}: ${t.error}`)
        .join('\n  ')
      errorMessage = `${failedTests.length} test cases failed: ${failedIds}\n  ${errors}`
    }
  } catch (error) {
    testFailed = true
    errorMessage = `Test execution error: ${error.message}`
  }

  // Explicitly fail the test if any test cases failed
  if (testFailed) {
    throw new Error(errorMessage)
  }
}
