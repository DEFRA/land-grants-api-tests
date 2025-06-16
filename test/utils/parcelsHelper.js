// Helper functions for /parcels endpoint API testing
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
 * Validate required parcels structure
 */
export function validateParcelsStructure(response, testCase) {
  // Validate if parcels are available in the response
  if (!response.body.parcels) {
    throw new Error('Response missing parcels data')
  }

  const parcels = response.body.parcels

  // Validate if expected sheetId and parcelId are available in the response
  const expectedParcel = parcels.find(
    (parcel) =>
      parcel.sheetId === testCase.expectedSheetId &&
      parcel.parcelId === testCase.expectedParcelId
  )

  if (!expectedParcel) {
    const availableParcels = parcels
      .map((parcel) => `${parcel.sheetId}-${parcel.parcelId}`)
      .join(', ')
    throw new Error(
      `SheetId and parcelId validation failed: expected '${testCase.expectedSheetId}-${testCase.expectedParcelId}' but found: [${availableParcels}]`
    )
  }
}

/**
 * Validates size unit from the parcel
 */
export function validateSizeUnit(response, testCase) {
  if (!testCase.fields.includes('size')) return

  const parcels = response.body.parcels

  // fetching the required parcel for validation
  const parcel = parcels.find(
    (parcel) =>
      parcel.sheetId === testCase.expectedSheetId &&
      parcel.parcelId === testCase.expectedParcelId
  )

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
  if (!testCase.fields.includes('size')) return

  const parcels = response.body.parcels

  // fetching the required parcel for validation
  const parcel = parcels.find(
    (parcel) =>
      parcel.sheetId === testCase.expectedSheetId &&
      parcel.parcelId === testCase.expectedParcelId
  )

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
  if (
    !testCase.fields.includes('actions') &&
    !testCase.fields.includes('actions.availableArea')
  )
    return

  const parcels = response.body.parcels

  // fetching the required parcel for validation
  const parcel = parcels.find(
    (parcel) =>
      parcel.sheetId === testCase.expectedSheetId &&
      parcel.parcelId === testCase.expectedParcelId
  )

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
 * Validate available area from the parcel
 */
export function validateAvailableArea(response, testCase) {
  if (!testCase.fields.includes('actions.availableArea')) return

  const expectedActionCode = testCase.expectedActionCode
  const expectedActionDescription = testCase.expectedActionDescription
  const expectedAvailableAreaUnit = testCase.expectedAvailableAreaUnit
  const expectedAvailableAreaValue = Number(testCase.expectedAvailableAreaValue)
  const parcels = response.body.parcels

  // fetching the required parcel for validation
  const parcel = parcels.find(
    (parcel) =>
      parcel.sheetId === testCase.expectedSheetId &&
      parcel.parcelId === testCase.expectedParcelId
  )

  parcel.actions.forEach((action) => {
    const actualActionCode = action.code

    if (actualActionCode === expectedActionCode) {
      const actualActionDescription = action.description
      const actualAvailableAreaUnit = action.availableArea.unit
      const actualAvailableAreaValue = action.availableArea.value
      if (actualActionDescription !== expectedActionDescription) {
        throw new Error(
          `Action description validation failed: expected ${expectedActionDescription} but got ${actualActionDescription}`
        )
      }

      if (actualAvailableAreaUnit !== expectedAvailableAreaUnit) {
        throw new Error(
          `Available area unit validation failed: expected ${expectedAvailableAreaUnit} but got ${actualAvailableAreaUnit}`
        )
      }

      if (expectedAvailableAreaValue !== actualAvailableAreaValue) {
        throw new Error(
          `Available area value validation failed: expected ${expectedAvailableAreaValue} but got ${actualAvailableAreaValue}`
        )
      }
    }
  })
}

/**
 * Custom validator for parcel fields
 */
export function validateParcelFields(response, testCase) {
  // Only validate successful responses
  if (response.status !== 200) {
    return // Non-200 responses are validated elsewhere
  }

  const parcels = response.body.parcels

  // Check if parcel exists
  if (!parcels) {
    throw new Error('Response does not contain parcels data')
  }

  // Validate if expected sheetId and parcelId are available in the response
  const expectedParcel = parcels.find(
    (parcel) =>
      parcel.sheetId === testCase.expectedSheetId &&
      parcel.parcelId === testCase.expectedParcelId
  )

  if (!expectedParcel) {
    const availableParcels = parcels
      .map((parcel) => `${parcel.sheetId}-${parcel.parcelId}`)
      .join(', ')
    throw new Error(
      `SheetId and parcelId validation failed: expected '${testCase.expectedSheetId}-${testCase.expectedParcelId}' but found: [${availableParcels}]`
    )
  }

  // Validate size
  validateParcelSize(expectedParcel, testCase)

  // Validate actions
  validateParcelActions(expectedParcel, testCase)

  // Validate available area
  validateParcelAvailableArea(expectedParcel, testCase)
}

/**
 * Validate size fields if expected
 */
export function validateParcelSize(parcel, testCase) {
  // Skip if no size is available in the request
  if (!testCase.fields.includes('size')) {
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
 * Validate actions if expected
 */
export function validateParcelActions(parcel, testCase) {
  if (
    !testCase.fields.includes('actions') &&
    !testCase.fields.includes('actions.availableArea')
  )
    return

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

/**
 * Validate available area fields if expected
 */
export function validateParcelAvailableArea(parcel, testCase) {
  // Skip if availableArea is not requested
  if (!testCase.fields.includes('actions.availableArea')) {
    return
  }

  const expectedActionCode = testCase.expectedActionCode
  const expectedActionDescription = testCase.expectedActionDescription
  const expectedAvailableAreaUnit = testCase.expectedAvailableAreaUnit
  const expectedAvailableAreaValue = Number(testCase.expectedAvailableAreaValue)

  // validate available area for each action
  parcel.actions.forEach((action) => {
    const actualActionCode = action.code

    if (actualActionCode === expectedActionCode) {
      // Check if availableArea exists
      if (!action.availableArea) {
        throw new Error('Response does not contain availableArea data')
      }

      const actualActionDescription = action.description
      const actualAvailableAreaUnit = action.availableArea.unit
      const actualAvailableAreaValue = action.availableArea.value
      if (actualActionDescription !== expectedActionDescription) {
        throw new Error(
          `Action description validation failed: expected ${expectedActionDescription} but got ${actualActionDescription}`
        )
      }

      // Check availableArea unit
      if (testCase.expectedAvailableAreaUnit) {
        if (actualAvailableAreaUnit !== expectedAvailableAreaUnit) {
          throw new Error(
            `Expected availableArea unit '${expectedAvailableAreaUnit}' but got '${actualAvailableAreaUnit}'`
          )
        }
      }

      // Check availableArea value
      if (testCase.expectedAvailableAreaValue) {
        if (isNaN(expectedAvailableAreaValue)) {
          throw new Error(
            `Expected availableArea.value is not a valid number: ${expectedAvailableAreaValue}`
          )
        }

        if (typeof actualAvailableAreaValue !== 'number') {
          throw new Error(
            `Actual availableArea.value is not a number: ${actualAvailableAreaValue}`
          )
        }

        if (actualAvailableAreaValue !== expectedAvailableAreaValue) {
          throw new Error(
            `Expected availableArea.value ${expectedAvailableAreaValue} but got ${actualAvailableAreaValue}`
          )
        }
      }
    }
  })
}
