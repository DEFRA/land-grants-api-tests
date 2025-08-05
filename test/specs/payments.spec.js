import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { PAYMENTS_ENDPOINT } from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  validatePayment,
  validateParcelItems,
  validateAgreementLevelItems,
  validatePaymentAmountsAndDates
} from '../utils/paymentsHelper.js'

describe('Payments endpoint', () => {
  it('should validate payment amounts and dates', async () => {
    const dataFile = './test/data/paymentsData.csv'

    const validatePayments = async (testCase, options = {}) => {
      const startDate = testCase.startDate
      const landActions = JSON.parse(testCase.landActions)

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(PAYMENTS_ENDPOINT)
        .send({ startDate, landActions })
        .set('Accept', 'application/json')

      // Validate basic status code match before other validations
      validateStatusCode(response, testCase)

      // For 200 responses, perform detailed validations
      if (response.status === 200) {
        // Validate success message
        validateSuccessMessage(response, testCase)

        // Validate agreement start date, end date, frequency, agreement total amount and annual amount
        validatePayment(response, testCase)

        // Validate parcel items
        validateParcelItems(response, testCase)

        // Validate agreement level items
        validateAgreementLevelItems(response, testCase)
      }

      // Validate payment amounts and dates
      validatePaymentAmountsAndDates(response, testCase)
    }

    // Run tests with our helper that handles test result tracking
    await runTestsAndRecordResults(dataFile, validatePayments)
  })
})
