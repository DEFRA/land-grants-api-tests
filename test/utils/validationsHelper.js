// Helper functions for /actions/validate endpoint API testing
/**
 * Validate response status code
 */
export function validateStatusCode(response, testCase, columnName) {
  const expectedStatus = testCase[columnName]
    ? Number(testCase[columnName])
    : 200
  if (response.status !== expectedStatus) {
    throw new Error(
      `Expected status ${expectedStatus} but got ${response.status}`
    )
  }
}

/**
 * Validate response message for a 200 response
 */
export function validateSuccessMessage(response, testCase, columnName) {
  if (!testCase[columnName]) return

  const actualMessage = response.body.message || ''

  if (actualMessage !== testCase[columnName]) {
    throw new Error(
      `Message validation failed: expected '${testCase[columnName]}' but got '${actualMessage}'`
    )
  }
}

/**
 * Validate error messages
 */

export function validateErrorMessage(response, testCase) {
  // Check if message is valid

  if (String(response.body.valid) !== String(testCase.valid).toLowerCase()) {
    throw new Error(
      `Validation failed: expected valid to be ${testCase.valid} but got ${response.body.valid}`
    )
  }

  // If valid is false, check error messages

  if (String(testCase.valid).toLowerCase() === 'false') {
    console.log('checking error messages...')
    const errorMessages = response.body.errorMessages

    errorMessages.forEach((errorMessage, index) => {
      const actualCode = errorMessage.code
      const actualMessage = errorMessage.description
      const actualSheetId = errorMessage.sheetId
      const actualParcelId = errorMessage.parcelId
      const actualResult = errorMessage.passed
      const expectedCode = testCase[`code${index + 1}`]
      const expectedMessage = testCase[`errorMessages_description${index + 1}`]
      const expectedSheetId = testCase[`errorMessages_sheetId${index + 1}`]
      const expectedParcelId = testCase[`errorMessages_parcelId${index + 1}`]

      if (actualCode !== expectedCode) {
        throw new Error(
          `Validation failed: expected error code to be ${expectedCode} but got ${actualCode}`
        )
      }

      if (actualMessage !== expectedMessage) {
        throw new Error(
          `Validation failed: expected error message to be "${expectedMessage}" but got "${actualMessage}"`
        )
      }

      if (String(actualSheetId) !== String(expectedSheetId)) {
        throw new Error(
          `Validation failed: expected sheetId to be ${expectedSheetId} but got ${actualSheetId}`
        )
      }

      if (String(actualParcelId) !== String(expectedParcelId)) {
        throw new Error(
          `Validation failed: expected parcelId to be ${expectedParcelId} but got ${actualParcelId}`
        )
      }

      if (String(actualResult).toLowerCase() !== 'false') {
        throw new Error(
          `Validation failed: expected passed to be false but got ${actualResult}`
        )
      }
    })
  }
}

export function applicationValidationCheck(response, testCase, columnName) {
  // Check if message is valid

  if (
    String(response.body.valid) !== String(testCase[columnName]).toLowerCase()
  ) {
    throw new Error(
      `Validation failed: expected valid to be ${testCase[columnName]} but got ${response.body.valid}`
    )
  }
}

export function applicationValidationRunCheck(response, testCase, runId) {
  // Check if id matches
  if (response.body.applicationValidationRun.id !== runId) {
    throw new Error(
      `Validation failed: expected id to be ${runId} but got ${response.body.applicationValidationRun.id}`
    )
  }

  // Check if applicationId matches
  if (
    String(response.body.applicationValidationRun.application_id) !==
    String(testCase.applicationId)
  ) {
    throw new Error(
      `Validation failed: expected applicationId to be ${testCase.applicationId} but got ${response.body.applicationValidationRun.application_id}`
    )
  }

  // Check if sbi matches
  if (
    String(response.body.applicationValidationRun.sbi) !== String(testCase.sbi)
  ) {
    throw new Error(
      `Validation failed: expected sbi to be ${testCase.sbi} but got ${response.body.applicationValidationRun.sbi}`
    )
  }

  // Check if crn matches
  if (
    String(response.body.applicationValidationRun.crn) !==
    String(testCase.applicantCrn)
  ) {
    throw new Error(
      `Validation failed: expected crn to be ${testCase.applicantCrn} but got ${response.body.applicationValidationRun.crn}`
    )
  }

  // Check if hasPassed matches
  if (
    String(
      response.body.applicationValidationRun.data.hasPassed
    ).toLowerCase() !== String(testCase.hasPassed).toLowerCase()
  ) {
    throw new Error(
      `Validation failed: expected has_passed to be ${testCase.hasPassed} but got ${response.body.applicationValidationRun.data.hasPassed}`
    )
  }

  // Check if requester matches
  if (
    String(response.body.applicationValidationRun.data.requester) !==
    String(testCase.requester)
  ) {
    throw new Error(
      `Validation failed: expected requester to be ${testCase.requester} but got ${response.body.applicationValidationRun.data.requester}`
    )
  }
}
