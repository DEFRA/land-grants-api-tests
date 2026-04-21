import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import {
  WMP_VALIDATIONS_ENDPOINT,
  BEARER_TOKEN
} from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  validateErrorMessage,
  wmpValidateApplicationRules
} from '../utils/validationsHelper.js'

describe('WMP Validations V1 endpoint', () => {
  it('should validate WMP(PA3) application', async () => {
    const dataFile =
      './test/data/wmp/validations/wmp_applicationsValidationsData_v1.csv'

    const validateMessages = async (testCase, options = {}) => {
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
      const payload = { parcelIds }
      if (oldWoodlandAreaHa !== null) {
        payload.oldWoodlandAreaHa = oldWoodlandAreaHa
      }
      if (newWoodlandAreaHa !== null) {
        payload.newWoodlandAreaHa = newWoodlandAreaHa
      }

      console.log('Payload being sent:', payload) // Debug log to check payload structure

      // Make the API request to /application/validate endpoint
      const validationResponse = await request(global.baseUrl)
        .post(WMP_VALIDATIONS_ENDPOINT)
        .send(payload)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', `${process.env.API_KEY}`)
        .set('Accept-Encoding', '*')

      // Validate basic status code match before other validations
      validateStatusCode(
        validationResponse,
        testCase,
        'expectedValidationStatusCode'
      )

      // For 200 responses, perform detailed validations
      if (validationResponse.status === 200) {
        // Validate success message
        validateSuccessMessage(
          validationResponse,
          testCase,
          'expectedValidationMessage'
        )

        // validate wmp application validation response
        wmpValidateApplicationRules(validationResponse, testCase)
      } else {
        // For non-200 responses, validate status code
        validateStatusCode(
          validationResponse,
          testCase,
          'expectedValidationStatusCode'
        )

        validateSuccessMessage(
          validationResponse,
          testCase,
          'expectedValidationMessage'
        )

        validateErrorMessage(validationResponse, testCase)
      }
    }
    // Run tests with our helper that handles test result tracking
    await runTestsAndRecordResults(dataFile, validateMessages)
  })
})
