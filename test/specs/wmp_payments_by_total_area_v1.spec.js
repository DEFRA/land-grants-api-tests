import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import {
  BEARER_TOKEN,
  WMP_PAYMENTS_CALCULATE_BY_TOTAL_AREA_ENDPOINT,
  API_KEY
} from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  validatePayment,
  validateParcelItems,
  validateAgreementLevelItems,
  validatePaymentAmountsAndDates,
  validateErrorMessage
} from '../utils/paymentsHelper.js'

describe('WMP Payments by total area endpoint v1.0.0', () => {
  it('should validate WMP(PA3) payment amounts and dates by total area', async () => {
    const dataFile =
      './test/data/wmp/payments/wmp_payments_calculate_by_total_areaData_v1.csv'

    const validatePayments = async (testCase, options = {}) => {
      const startDate = testCase.startDate
      const applicationId =
        testCase.applicationId && testCase.applicationId.trim() !== ''
          ? testCase.applicationId
          : `app-${Math.random().toString(36).substring(2, 10)}`
      const crn = testCase.crn && testCase.crn.trim()
      const sbi = testCase.sbi && testCase.sbi.trim()
      const totalAreaHa = testCase.totalAreaHa

      const payload = {
        startDate,
        applicationId,
        crn,
        sbi,
        totalAreaHa
      }

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(WMP_PAYMENTS_CALCULATE_BY_TOTAL_AREA_ENDPOINT)
        .send(payload)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', API_KEY || '')
        .set('Accept-Encoding', '*')

      console.log(
        `Request Payload for test case ${testCase.testCaseId}:`,
        payload
      )
      console.log(
        `Response for test case ${testCase.testCaseId}:`,
        response.body
      )

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
