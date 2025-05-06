// Helper functions for /parcel endpoint API testing
/**
 * Validate response status code
 */
export function validateStatusCode(response, testCase) {
  const expectedStatus = testCase.expectedStatusCode
    ? Number(testCase.expectedStatusCode)
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
export function validateSuccessMessage(response, testCase) {
  if (!testCase.expectedMessage) return

  const actualMessage = response.body.message || ''

  if (actualMessage !== testCase.expectedMessage) {
    throw new Error(
      `Message validation failed: expected '${testCase.expectedMessage}' but got '${actualMessage}'`
    )
  }
}

/**
 * Validate error message for non-200 responses
 */
export function validateErrorMessage(response, testCase) {
  if (!testCase.expectedMessage) return

  const actualMessage = response.body.message || ''

  if (actualMessage !== testCase.expectedMessage) {
    throw new Error(
      `Error message validation failed: expected '${testCase.expectedMessage}' but got '${actualMessage}'`
    )
  }
}

/**
 * Validate required parcel structure
 */
export function validateParcelStructure(response) {
  if (!response.body.parcel || !response.body.parcel.size) {
    throw new Error('Response missing parcel.size data')
  }
}

/**
 * Custom validator for parcel fields
 */
export function validateParcelFields(response, testCase) {
  // Only validate successful responses
  if (response.status !== 200) {
    return // Non-200 responses are validated elsewhere
  }

  const { parcel } = response.body

  // Check if parcel exists
  if (!parcel) {
    throw new Error('Response does not contain parcel data')
  }

  // Validate basic fields
  if (parcel.parcelId !== testCase.parcelId) {
    throw new Error(
      `Expected parcelId '${testCase.parcelId}' but got '${parcel.parcelId}'`
    )
  }

  if (parcel.sheetId !== testCase.sheetId) {
    throw new Error(
      `Expected sheetId '${testCase.sheetId}' but got '${parcel.sheetId}'`
    )
  }

  // Validate size
  validateParcelSize(parcel, testCase)

  // Validate actions
  validateParcelActions(parcel, testCase)
}

/**
 * Validate size fields if expected
 */
export function validateParcelSize(parcel, testCase) {
  // Skip if no size expectations
  if (!testCase.expectedSizeUnit && !testCase.expectedSizeValue) {
    return
  }

  // Check if size exists
  if (!parcel.size) {
    throw new Error('Response does not contain size data')
  }

  // Check unit
  if (testCase.expectedSizeUnit) {
    if (parcel.size.unit !== testCase.expectedSizeUnit) {
      throw new Error(
        `Expected size.unit '${testCase.expectedSizeUnit}' but got '${parcel.size.unit}'`
      )
    }
  }

  // Check value
  if (testCase.expectedSizeValue) {
    const expectedValue = Number(testCase.expectedSizeValue)
    const actualValue = parcel.size.value

    if (isNaN(expectedValue)) {
      throw new Error(
        `Expected size.value is not a valid number: ${testCase.expectedSizeValue}`
      )
    }

    if (typeof actualValue !== 'number') {
      throw new Error(`Actual size.value is not a number: ${actualValue}`)
    }

    if (actualValue !== expectedValue) {
      throw new Error(
        `Expected size.value ${expectedValue} but got ${actualValue}`
      )
    }
  }
}

/**
 * Validates size unit from the parcel
 */
export function validateSizeUnit(response, testCase) {
  if (!testCase.expectedSizeUnit) return

  const { parcel } = response.body
  const actualUnit = parcel.size.unit

  if (actualUnit !== testCase.expectedSizeUnit) {
    throw new Error(
      `Size unit validation failed: expected '${testCase.expectedSizeUnit}' but got '${actualUnit}'`
    )
  }
}

/**
 * Validates size value from the parcel
 */
export function validateSizeValue(response, testCase) {
  if (!testCase.expectedSizeValue) return

  const { parcel } = response.body
  const expectedValue = Number(testCase.expectedSizeValue)
  const actualValue = parcel.size.value

  if (actualValue !== expectedValue) {
    throw new Error(
      `Size value validation failed: expected ${expectedValue} but got ${actualValue}`
    )
  }
}

/**
 * Validates action code from the parcel
 */
export function validateActionCode(response, testCase) {
  if (!testCase.expectedActionCode) return

  const { parcel } = response.body

  if (!parcel.actions || !Array.isArray(parcel.actions)) {
    throw new Error('Response missing actions data')
  }

  const actionWithCode = parcel.actions.find(
    (action) => action.code === testCase.expectedActionCode
  )

  if (!actionWithCode) {
    const availableCodes = parcel.actions
      .map((action) => action.code)
      .join(', ')
    throw new Error(
      `Action code validation failed: expected '${testCase.expectedActionCode}' but found: [${availableCodes}]`
    )
  }
}

/**
 * Validate actions if expected
 */
export function validateParcelActions(parcel, testCase) {
  if (!testCase.expectedActionCode) return

  if (
    !parcel.actions ||
    !Array.isArray(parcel.actions) ||
    parcel.actions.length === 0
  ) {
    throw new Error(
      'Response does not contain actions data or actions array is empty'
    )
  }

  // Find action with expected code
  const actionWithCode = parcel.actions.find(
    (action) => action.code === testCase.expectedActionCode
  )
  if (!actionWithCode) {
    const availableCodes = parcel.actions
      .map((action) => action.code)
      .join(', ')
    throw new Error(
      `Expected action code '${testCase.expectedActionCode}' but found: [${availableCodes}]`
    )
  }
}
