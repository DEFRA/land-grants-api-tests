// Helper functions for /application/validate and /api/v2/application/validate endpoints API testing

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
  // skip error message validation if valid is not defined
  if (!testCase.valid) return

  // Check if message is valid

  if (String(response.body.valid) !== String(testCase.valid).toLowerCase()) {
    throw new Error(
      `Validation failed: expected valid to be ${testCase.valid} but got ${response.body.valid}`
    )
  }

  // If valid is false, check error messages
  if (
    String(testCase.valid).toLowerCase() === 'false' &&
    response.status === 200
  ) {
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
  } else if (
    String(testCase.valid).toLowerCase() === 'false' &&
    response.status === 400
  ) {
    response.body.errorMessages.forEach((errorMessage, index) => {
      if (
        errorMessage.description !==
        testCase[`errorMessages_description${index + 1}`]
      ) {
        throw new Error(
          `Validation failed: expected error message to be "${testCase[`errorMessages_description${index + 1}`]}" but got "${errorMessage.description}"`
        )
      }
    })
  }
}

/** Validate application validation run details
 */
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

/**
 * Validate application rules and their results
 */
export function validateApplicationRules(response, testCase) {
  // Check if application is valid
  if (String(response.body.valid) !== String(testCase.valid).toLowerCase()) {
    throw new Error(
      `Validation failed: expected valid to be ${testCase.valid} but got ${response.body.valid}`
    )
  }

  // check actions of the application
  if (response.status === 200) {
    const actions = response.body.actions

    actions.forEach((action, actionIndex) => {
      const actualCode = action.actionCode
      const actualSheetId = action.sheetId
      const actualParcelId = action.parcelId
      const actualResult = action.hasPassed
      const expectedCode = testCase[`actions${actionIndex + 1}_actionCode`]
      const expectedSheetId = testCase[`actions${actionIndex + 1}_sheetId`]
      const expectedParcelId = testCase[`actions${actionIndex + 1}_parcelId`]
      const expectedResult = testCase[`actions${actionIndex + 1}_hasPassed`]

      if (actualCode !== expectedCode) {
        throw new Error(
          `Validation failed: expected actions${actionIndex + 1}_actionCode to be ${expectedCode} but got ${actualCode}`
        )
      }

      if (String(actualSheetId) !== String(expectedSheetId)) {
        throw new Error(
          `Validation failed: expected actions${actionIndex + 1}_sheetId to be ${expectedSheetId} but got ${actualSheetId}`
        )
      }

      if (String(actualParcelId) !== String(expectedParcelId)) {
        throw new Error(
          `Validation failed: expected actions${actionIndex + 1}_parcelId to be ${expectedParcelId} but got ${actualParcelId}`
        )
      }

      if (String(actualResult) !== String(expectedResult).toLowerCase()) {
        throw new Error(
          `Validation failed: expected actions${actionIndex + 1}_hasPassed to be ${expectedResult} but got ${actualResult}`
        )
      }

      // check rules within each action
      const rules = action.rules
      rules.forEach((rule, ruleIndex) => {
        const actualRuleName = rule.name
        const actualRulePassed = rule.passed
        const actualRuleReason = rule.reason
        const actualRuleDescription = rule.description
        const expectedRuleName =
          testCase[`actions${actionIndex + 1}_rules${ruleIndex + 1}_name`]
        const expectedRulePassed =
          testCase[`actions${actionIndex + 1}_rules${ruleIndex + 1}_passed`]
        const expectedRuleReason =
          testCase[`actions${actionIndex + 1}_rules${ruleIndex + 1}_reason`]
        const expectedRuleDescription =
          testCase[
            `actions${actionIndex + 1}_rules${ruleIndex + 1}_description`
          ]

        if (actualRuleName !== expectedRuleName) {
          throw new Error(
            `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_name to be ${expectedRuleName} but got ${actualRuleName}`
          )
        }

        if (
          String(actualRulePassed) !== String(expectedRulePassed).toLowerCase()
        ) {
          throw new Error(
            `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_passed to be ${expectedRulePassed} but got ${actualRulePassed}`
          )
        }

        if (actualRuleReason !== expectedRuleReason) {
          throw new Error(
            `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_reason to be ${expectedRuleReason} but got ${actualRuleReason}`
          )
        }

        if (actualRuleDescription !== expectedRuleDescription) {
          throw new Error(
            `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_description to be ${expectedRuleDescription} but got ${actualRuleDescription}`
          )
        }

        // check caveat details if a consent is required from Natural England'
        if (actualRuleReason === 'A consent is required from Natural England') {
          const caveat = rule.caveat
          const actualRuleCaveatCode = caveat.code
          const actualRuleCaveatDescription = caveat.description
          // const actualActionCode = caveat.metadata.actionCode
          const actualParcelId = caveat.metadata.parcelId
          const actualSheetId = caveat.metadata.sheetId
          const actualPercentageOverlap = caveat.metadata.percentageOverlap
          const actualOverlapAreaHectares = caveat.metadata.overlapAreaHectares
          const expectedRuleCaveatCode =
            testCase[
              `actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_code`
            ]
          const expectedRuleCaveatDescription =
            testCase[
              `actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_description`
            ]
          // const expectedActionCode = testCase[`actions${action_index + 1}_rules${rule_index + 1}_caveat_metadata_actionCode`]
          const expectedParcelId =
            testCase[
              `actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_metadata_parcelId`
            ]
          const expectedSheetId =
            testCase[
              `actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_metadata_sheetId`
            ]
          const expectedPercentageOverlap =
            testCase[
              `actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_metadata_percentageOverlap`
            ]
          const expectedOverlapAreaHectares =
            testCase[
              `actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_metadata_overlapAreaHectares`
            ]

          if (actualRuleCaveatCode !== expectedRuleCaveatCode) {
            throw new Error(
              `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_code to be ${expectedRuleCaveatCode} but got ${actualRuleCaveatCode}`
            )
          }

          if (actualRuleCaveatDescription !== expectedRuleCaveatDescription) {
            throw new Error(
              `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_description to be ${expectedRuleCaveatDescription} but got ${actualRuleCaveatDescription}`
            )
          }

          // if (actualActionCode !== expectedActionCode) {
          //   throw new Error(
          //     `Validation failed: expected actions${action_index + 1}_rules${rule_index + 1}_caveat_metadata_actionCode to be ${expectedActionCode} but got ${actualActionCode}`
          //   )
          // }

          if (String(actualParcelId) !== String(expectedParcelId)) {
            throw new Error(
              `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_metadata_parcelId to be ${expectedParcelId} but got ${actualParcelId}`
            )
          }

          if (String(actualSheetId) !== String(expectedSheetId)) {
            throw new Error(
              `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_metadata_sheetId to be ${expectedSheetId} but got ${actualSheetId}`
            )
          }

          if (actualPercentageOverlap !== Number(expectedPercentageOverlap)) {
            throw new Error(
              `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_metadata_percentageOverlap to be ${expectedPercentageOverlap} but got ${actualPercentageOverlap}`
            )
          }

          if (
            actualOverlapAreaHectares !== Number(expectedOverlapAreaHectares)
          ) {
            throw new Error(
              `Validation failed: expected actions${actionIndex + 1}_rules${ruleIndex + 1}_caveat_metadata_overlapAreaHectares to be ${expectedOverlapAreaHectares} but got ${actualOverlapAreaHectares}`
            )
          }
        }
      })
    })
  } else if (response.status === 400) {
    response.body.errorMessages.forEach((errorMessage, index) => {
      if (
        errorMessage.description !==
        testCase[`errorMessages_description${index + 1}`]
      ) {
        throw new Error(
          `Validation failed: expected error message to be "${testCase[`errorMessages_description${index + 1}`]}" but got "${errorMessage.description}"`
        )
      }
    })
  }
}
