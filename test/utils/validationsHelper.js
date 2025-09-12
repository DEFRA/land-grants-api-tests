// Helper functions for /actions/validate endpoint API testing
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
