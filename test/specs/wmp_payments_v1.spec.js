import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { BEARER_TOKEN, WMP_PAYMENTS_ENDPOINT } from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  validatePayment,
  validateParcelItems,
  validateAgreementLevelItems,
  validatePaymentAmountsAndDates,
  validateErrorMessage
} from '../utils/paymentsHelper.js'

describe('WMP Payments endpoint v1.0.0', () => {
  it('should validate WMP(PA3) payment amounts and dates', async () => {
    const dataFile = './test/data/wmp_paymentsData_v1.csv'

    const validatePayments = async (testCase, options = {}) => {
      const startDate = testCase.startDate
      const parcelIds = testCase.parcelIds.split(',')
      const oldWoodlandAreaHa =
        testCase.oldWoodlandAreaHa !== ''
          ? Number(testCase.oldWoodlandAreaHa)
          : null
      const newWoodlandAreaHa =
        testCase.newWoodlandAreaHa !== ''
          ? Number(testCase.newWoodlandAreaHa)
          : null

      // Build the payload conditionally
      const payload = { startDate, parcelIds }
      if (oldWoodlandAreaHa !== null) {
        payload.oldWoodlandAreaHa = oldWoodlandAreaHa
      }
      if (newWoodlandAreaHa !== null) {
        payload.newWoodlandAreaHa = newWoodlandAreaHa
      }

      console.log('Testing with payload:', payload)

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(WMP_PAYMENTS_ENDPOINT)
        .send(payload)
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
        validatePayment(response, testCase, 'wmp')

        // Validate parcel items
        validateParcelItems(response, testCase)

        // Validate agreement level items
        validateAgreementLevelItems(response, testCase, 'wmp')

        // Validate payment amounts and dates
        validatePaymentAmountsAndDates(response, testCase, 'wmp')
      } else {
        // Validate error message for non-200 responses
        validateErrorMessage(response, testCase)
      }
    }
    // Run tests with our helper that handles test result tracking
    await runTestsAndRecordResults(dataFile, validatePayments)
  })
})
