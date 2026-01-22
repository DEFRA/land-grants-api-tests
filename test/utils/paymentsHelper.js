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

export function validatePayment(response, testCase) {
  // Validate if payment is available in the response
  if (!response.body.payment) {
    throw new Error('Response missing payment data')
  }

  const payment = response.body.payment
  const actualSgreementStartDate = testCase.agreementStartDate.replace(/"/g, '')
  const actualAgreementEndDate = testCase.agreementEndDate.replace(/"/g, '')

  // Validate agreement start date
  if (payment.agreementStartDate !== actualSgreementStartDate) {
    throw new Error(
      `Expected agreementStartDate ${actualSgreementStartDate} but got ${payment.agreementStartDate}`
    )
  }

  // Validate agreement end date
  if (payment.agreementEndDate !== actualAgreementEndDate) {
    throw new Error(
      `Expected agreementEndDate ${actualAgreementEndDate} but got ${payment.agreementEndDate}`
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
  if (payment.annualTotalPence !== Number(testCase.annualTotalPence)) {
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

export function validateAgreementLevelItems(response, testCase) {
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

  if (!testCase.agreementLevelItems_annualPaymentPence) {
    return
  }

  // Validate annualPaymentPence for each itemId
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
}
export function validatePaymentAmountsAndDates(response, testCase) {
  // Validate if payment amounts and dates are available in the response
  if (!response.body.payment.payments) {
    throw new Error('Response missing payment amounts and dates data')
  }

  const payments = response.body.payment.payments

  // Validate the number of payment items is 4
  if (payments.length !== 4) {
    throw new Error(`Expected 4 payment items but got ${payments.length}`)
  }

  // Validate first payment amount
  const firstPaymentAmount = Number(testCase.Payment1_totalPaymentPence)
  if (payments[0].totalPaymentPence !== firstPaymentAmount) {
    throw new Error(
      `Expected totalPaymentPence for Payment 1 is ${firstPaymentAmount} but got ${payments[0].totalPaymentPence}`
    )
  }

  // Validate payment amount from 2nd payment onwards
  const PaymentAmount = Number(testCase.Payment2ToPayment4_totalPaymentPence)
  payments.forEach((payment, index) => {
    if (index >= 1 && payment.totalPaymentPence !== PaymentAmount) {
      throw new Error(
        `Expected totalPaymentPence for Payment ${index + 1} is ${PaymentAmount} but got ${payment.totalPaymentPence}`
      )
    }
  })

  // Validate each payment date
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
