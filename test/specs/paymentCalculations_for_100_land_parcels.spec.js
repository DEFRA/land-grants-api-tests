import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { PAYMENTS_ENDPOINT_V2, BEARER_TOKEN } from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage
} from '../utils/validationsHelper.js'

describe.skip('Payment Calculations V2 endpoint test with 100 land parcels', () => {
  it('should calculate payments for application with 100 land parcels having 3 actions each', async () => {
    const dataFiles = [
      './test/data/sfi/payments/paymentData_for_100_land_parcels.csv'
    ]

    const validatePayments = async (testCase, options = {}) => {
      const parcel = JSON.parse(testCase.parcel)

      const applicationId =
        testCase.applicationId !== '' ? testCase.applicationId : null

      // Build the payload conditionally
      const payload = { parcel }
      if (applicationId !== null) {
        payload.applicationId = applicationId
      }

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(PAYMENTS_ENDPOINT_V2)
        .send(payload)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', `${process.env.API_KEY}`)
        .set('Accept-Encoding', '*')

      // Validate status code
      validateStatusCode(response, testCase, 'expectedStatusCode')

      // Validate success message
      validateSuccessMessage(response, testCase, 'expectedMessage')
    }

    // Run tests with our helper that handles test result tracking
    for (const dataFile of dataFiles) {
      await runTestsAndRecordResults(dataFile, validatePayments)
    }
  })
})
