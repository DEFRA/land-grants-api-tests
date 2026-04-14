// Helper functions for /payments/calculate endpoint API testing
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
 * Validate agreement start date, end date, frequency, agreement total amount and annual amount
 */

export function validatePayment(response, testCase, scheme) {
  // Validate if payment is available in the response
  if (!response.body.payment) {
    throw new Error('Response missing payment data')
  }

  const payment = response.body.payment
  const expectedAgreementStartDate = testCase.agreementStartDate.replace(
    /"/g,
    ''
  )
  const expectedAgreementEndDate = testCase.agreementEndDate.replace(/"/g, '')

  // Validate agreement start date
  if (payment.agreementStartDate !== expectedAgreementStartDate) {
    throw new Error(
      `Expected agreementStartDate ${expectedAgreementStartDate} but got ${payment.agreementStartDate}`
    )
  }

  // Validate agreement end date
  if (payment.agreementEndDate !== expectedAgreementEndDate) {
    throw new Error(
      `Expected agreementEndDate ${expectedAgreementEndDate} but got ${payment.agreementEndDate}`
    )
  }

  // Validate agreement frequency
  if (payment.frequency !== testCase.frequency) {
    throw new Error(
      `Expected frequency ${testCase.frequency} but got ${payment.frequency}`
    )
  }

  // Validate agreement total amount
  if (payment.agreementTotalPence !== Number(testCase.agreementTotalPence)) {
    throw new Error(
      `Expected agreementTotalPence ${testCase.agreementTotalPence} but got ${payment.agreementTotalPence}`
    )
  }

  // Validate agreement annual amount
  if (
    scheme === 'sfi' &&
    payment.annualTotalPence !== Number(testCase.annualTotalPence)
  ) {
    throw new Error(
      `Expected annualTotalPence ${testCase.annualTotalPence} but got ${payment.annualTotalPence}`
    )
  }
}

/**
 * Validate parcel items
 */
export function validateParcelItems(response, testCase) {
  // Validate if parcelItems are available in the response
  if (!response.body.payment.parcelItems) {
    throw new Error('Response missing parcelItems data')
  }

  const parcelItems = response.body.payment.parcelItems
  const expectedParcelItemsCount = Number(testCase.expectedParcelItemsCount)

  // Validate the number of parcel items
  if (Object.keys(parcelItems).length !== expectedParcelItemsCount) {
    throw new Error(
      `Expected ${expectedParcelItemsCount} parcel items but got ${Object.keys(parcelItems).length}`
    )
  }

  // Validate each parcel item
  Object.keys(parcelItems).forEach((parcelItemId) => {
    console.log(`Validating parcel item id: ${parcelItemId}`)

    const actualItem = parcelItems[parcelItemId]
    const expectedParcelItemAnnualPaymentPence = Number(
      testCase[`parcelItem${parcelItemId}_annualPaymentPence`]
    )
    const expectedParcelItemCode = testCase[`parcelItem${parcelItemId}_code`]
    const expectedParcelItemDurationYears = Number(
      testCase[`parcelItem${parcelItemId}_durationYears`]
    )
    const expectedParcelItemversion =
      testCase[`parcelItem${parcelItemId}_version`]

    // Validate parcelItem code for each parcelItemId
    if (actualItem.code !== expectedParcelItemCode) {
      throw new Error(
        `Expected ParcelItem ${parcelItemId} code is ${expectedParcelItemCode} but got ${actualItem.code}`
      )
    }

    // Validate durationYears for each parcelItemId
    if (actualItem.durationYears !== expectedParcelItemDurationYears) {
      throw new Error(
        `Expected ParcelItem ${parcelItemId} durationYears is ${expectedParcelItemDurationYears} but got ${actualItem.durationYears}`
      )
    }

    // Validate version for each parcelItemId
    if (String(actualItem.version) !== expectedParcelItemversion) {
      throw new Error(
        `Expected ParcelItem ${parcelItemId} version is ${expectedParcelItemversion} but got ${actualItem.version}`
      )
    }

    // Validate annualPaymentPence for each parcelItemId
    if (
      actualItem.annualPaymentPence !== expectedParcelItemAnnualPaymentPence
    ) {
      throw new Error(
        `Expected ParcelItem ${parcelItemId} AnnualPaymentPence is ${expectedParcelItemAnnualPaymentPence} but got ${actualItem.annualPaymentPence}`
      )
    }
  })
}

export function validateAgreementLevelItems(response, testCase, scheme) {
  // Validate if agreementLevelItems are available in the response
  if (!response.body.payment.agreementLevelItems) {
    throw new Error('Response missing agreementLevelItems data')
  }

  const agreementLevelItems = response.body.payment.agreementLevelItems
  const expectedAgreementLevelItemsCount = Number(
    testCase.expectedAgreementLevelItemsCount
  )

  // Validate the number of agreement level items
  if (
    Object.keys(agreementLevelItems).length !== expectedAgreementLevelItemsCount
  ) {
    throw new Error(
      `Expected ${expectedAgreementLevelItemsCount} agreement level items but got ${Object.keys(agreementLevelItems).length}`
    )
  }

  // If scheme is SFI and agreementLevelItems_annualPaymentPence is not provided in the test case, skip annualPaymentPence validation for agreement level items
  if (scheme === 'sfi' && !testCase.agreementLevelItems_annualPaymentPence) {
    return
  }

  //
  if (scheme === 'sfi') {
    const itemId = Object.keys(agreementLevelItems)[0]
    const actualItem = agreementLevelItems[itemId]
    const expectedItemAnnualPaymentPence = Number(
      testCase.agreementLevelItems_annualPaymentPence
    )

    if (actualItem.annualPaymentPence !== expectedItemAnnualPaymentPence) {
      throw new Error(
        `Expected Agreement Item ${itemId} AnnualPaymentPence is ${expectedItemAnnualPaymentPence} but got ${actualItem.annualPaymentPence}`
      )
    }
  } else if (scheme === 'wmp') {
    const itemId = Object.keys(agreementLevelItems)[0]
    const actualItem = agreementLevelItems[itemId]
    const actualCode = actualItem.code
    const actualDescription = actualItem.description
    const actualVersion = actualItem.version
    const actualParcelIds = JSON.stringify(actualItem.parcelIds)
    const actualActivePaymentTier = actualItem.activePaymentTier
    const actualQuantityInActiveTier = actualItem.quantityInActiveTier
    const actualActiveTierRatePence = actualItem.activeTierRatePence
    const actualActiveTierFlatRatePence = actualItem.activeTierFlatRatePence
    const actualQuantity = actualItem.quantity
    const actualAgreementTotalPence = actualItem.agreementTotalPence
    const actualUnit = actualItem.unit

    const expectedCode = testCase.expectedCode
    const expectedDescription = testCase.expectedDescription
    const expectedVersion = testCase.expectedVersion
    const expectedParcelIds = JSON.stringify(
      testCase.parcelIds.split(',').map((parcelId) => parcelId.trim())
    )
    console.log(`Expected parcelIds: ${expectedParcelIds}`)
    const expectedActivePaymentTier = Number(testCase.expectedActivePaymentTier)
    const expectedQuantityInActiveTier = Number(
      testCase.expectedQuantityInActiveTier
    )
    const expectedActiveTierRatePence = Number(
      testCase.expectedActiveTierRatePence
    )
    const expectedActiveTierFlatRatePence = Number(
      testCase.expectedActiveTierFlatRatePence
    )
    const expectedQuantity = Number(testCase.expectedQuantity)
    const expectedAgreementTotalPence = Number(
      testCase.expectedAgreementTotalPence
    )
    const expectedUnit = testCase.expectedUnit

    if (actualCode !== expectedCode) {
      throw new Error(
        `Expected Agreement Item code is ${expectedCode} but got ${actualCode}`
      )
    }

    if (actualDescription !== expectedDescription) {
      throw new Error(
        `Expected Agreement Item description is ${expectedDescription} but got ${actualDescription}`
      )
    }

    if (String(actualVersion) !== expectedVersion) {
      throw new Error(
        `Expected Agreement Item version is ${expectedVersion} but got ${actualVersion}`
      )
    }

    if (actualParcelIds !== expectedParcelIds) {
      throw new Error(
        `Expected Agreement Item parcelIds are ${expectedParcelIds} but got ${actualParcelIds}`
      )
    }

    if (actualActivePaymentTier !== expectedActivePaymentTier) {
      throw new Error(
        `Expected Agreement Item activePaymentTier is ${expectedActivePaymentTier} but got ${actualActivePaymentTier}`
      )
    }

    if (actualQuantityInActiveTier !== expectedQuantityInActiveTier) {
      throw new Error(
        `Expected Agreement Item quantityInActiveTier is ${expectedQuantityInActiveTier} but got ${actualQuantityInActiveTier}`
      )
    }

    if (actualActiveTierRatePence !== expectedActiveTierRatePence) {
      throw new Error(
        `Expected Agreement Item activeTierRatePence is ${expectedActiveTierRatePence} but got ${actualActiveTierRatePence}`
      )
    }

    if (actualActiveTierFlatRatePence !== expectedActiveTierFlatRatePence) {
      throw new Error(
        `Expected Agreement Item activeTierFlatRatePence is ${expectedActiveTierFlatRatePence} but got ${actualActiveTierFlatRatePence}`
      )
    }

    if (actualQuantity !== expectedQuantity) {
      throw new Error(
        `Expected Agreement Item quantity is ${expectedQuantity} but got ${actualQuantity}`
      )
    }

    if (actualAgreementTotalPence !== expectedAgreementTotalPence) {
      throw new Error(
        `Expected Agreement Item agreementTotalPence is ${expectedAgreementTotalPence} but got ${actualAgreementTotalPence}`
      )
    }

    if (actualUnit !== expectedUnit) {
      throw new Error(
        `Expected Agreement Item unit is ${expectedUnit} but got ${actualUnit}`
      )
    }
  } else {
    throw new Error(
      `Unknown scheme ${scheme} provided for agreement level items validation`
    )
  }
}

export function validatePaymentAmountsAndDates(response, testCase, scheme) {
  // Validate if payment amounts and dates are available in the response
  if (!response.body.payment.payments) {
    throw new Error('Response missing payment amounts and dates data')
  }

  const payments = response.body.payment.payments

  // Validate the number of payment items is 4 for SFI scheme and 1 for WMP scheme
  if (scheme === 'sfi' && payments.length !== 4) {
    throw new Error(`Expected 4 payment items but got ${payments.length}`)
  }
  if (scheme === 'wmp' && payments.length !== 1) {
    throw new Error(`Expected 1 payment item but got ${payments.length}`)
  }

  // Validate first payment amount
  const firstPaymentAmount = Number(testCase.Payment1_totalPaymentPence)
  if (payments[0].totalPaymentPence !== firstPaymentAmount) {
    throw new Error(
      `Expected totalPaymentPence for Payment 1 is ${firstPaymentAmount} but got ${payments[0].totalPaymentPence}`
    )
  }

  // Validate payment amount from 2nd payment onwards only for SFI scheme
  if (scheme === 'sfi') {
    const PaymentAmount = Number(testCase.Payment2ToPayment4_totalPaymentPence)
    payments.forEach((payment, index) => {
      if (index >= 1 && payment.totalPaymentPence !== PaymentAmount) {
        throw new Error(
          `Expected totalPaymentPence for Payment ${index + 1} is ${PaymentAmount} but got ${payment.totalPaymentPence}`
        )
      }
    })
  }

  // Validate payment date for sfi scheme
  if (scheme === 'sfi') {
    payments.forEach((payment, index) => {
      const expectedDate = testCase[`Payment${index + 1}_paymentDate`].replace(
        /"/g,
        ''
      )

      // Validate date
      if (payment.paymentDate !== expectedDate) {
        throw new Error(
          `Expected paymentDate for Payment ${index + 1} is ${expectedDate} but got ${payment.paymentDate}`
        )
      }
    })
  }

  // Validate payment date for wmp scheme - expected to be null
  if (scheme === 'wmp') {
    const expectedPaymentDate = testCase.Payment1_paymentDate
    if (String(payments[0].paymentDate) !== expectedPaymentDate) {
      throw new Error(
        `Expected paymentDate for Payment 1 is ${expectedPaymentDate} but got ${payments[0].paymentDate}`
      )
    }
  }
}
