import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { VALIDATIONS_ENDPOINT } from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage
} from '../utils/paymentsHelper.js'
import { validateErrorMessage } from '../utils/validationsHelper.js'

describe('Validations endpoint', () => {
  it('should validate error messages', async () => {
    const dataFile = './test/data/validationsData.csv'

    const validateMessages = async (testCase, options = {}) => {
      const landActions = JSON.parse(testCase.landActions)

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(VALIDATIONS_ENDPOINT)
        .send({ landActions })
        .set('Accept', 'application/json')

      // Validate basic status code match before other validations
      validateStatusCode(response, testCase)

      // For 200 responses, perform detailed validations
      if (response.status === 200) {
        // Validate success message
        validateSuccessMessage(response, testCase)

        // validate error messages
        validateErrorMessage(response, testCase)
      }
    }
    // Run tests with our helper that handles test result tracking
    await runTestsAndRecordResults(dataFile, validateMessages)
  })
})
