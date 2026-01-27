import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { BEARER_TOKEN, PAYMENTS_ENDPOINT_V2 } from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  validatePayment,
  validateParcelItems,
  validateAgreementLevelItems,
  validatePaymentAmountsAndDates,
  validateErrorMessage
} from '../utils/paymentsHelper.js'

describe('Payments endpoint v2.0.0', () => {
  it('should validate version2 payment amounts and dates', async () => {
    const dataFile = './test/data/paymentsData_v2.csv'

    const validatePayments = async (testCase, options = {}) => {
      const startDate = testCase.startDate
      const parcel = JSON.parse(testCase.parcel)

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(PAYMENTS_ENDPOINT_V2)
        .send({ startDate, parcel })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', `${process.env.API_KEY}`)
        .set('Accept-Encoding', '*')

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

        // Validate payment amounts and dates
        validatePaymentAmountsAndDates(response, testCase)
      } else {
        // Validate error message for non-200 responses
        validateErrorMessage(response, testCase)
      }
    }
    // Run tests with our helper that handles test result tracking
    await runTestsAndRecordResults(dataFile, validatePayments)
  })
})
