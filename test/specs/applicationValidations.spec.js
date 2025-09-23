import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import {
  APPLICATION_VALIDATIONS_ENDPOINT,
  APPLICATION_VALIDATION_RUN_ENDPOINT
} from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  applicationValidationCheck,
  applicationValidationRunCheck
} from '../utils/validationsHelper.js'

describe('Validations endpoint', () => {
  it('should validate land actions in the application', async () => {
    const dataFile = './test/data/applicationsValidationsData.csv'

    const validateMessages = async (testCase, options = {}) => {
      const applicationId = testCase.applicationId
      const requester = testCase.requester
      const applicantCrn = testCase.applicantCrn
      const landActions = JSON.parse(testCase.landActions)

      // Make the API request to /application/validate endpoint
      const validationResponse = await request(global.baseUrl)
        .post(APPLICATION_VALIDATIONS_ENDPOINT)
        .send({ applicationId, requester, applicantCrn, landActions })
        .set('Accept', 'application/json')

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
          'expectedValidationSuccessMessage'
        )

        // validate application validation
        applicationValidationCheck(validationResponse, testCase, 'Valid')
      }

      // Make the API request to /application/validation-run/{id} endpoint
      const runId = validationResponse.body.id

      const validationRunResponse = await request(global.baseUrl)
        .post(APPLICATION_VALIDATION_RUN_ENDPOINT + `/${runId}`)
        .set('Accept', 'application/json')

      // Validate basic status code match before other validations
      validateStatusCode(
        validationRunResponse,
        testCase,
        'expectedValidationRunStatusCode'
      )

      // For 200 responses, perform detailed validations
      if (validationRunResponse.status === 200) {
        // Validate success message
        validateSuccessMessage(
          validationRunResponse,
          testCase,
          'expectedValidationRunMessage'
        )

        // validate application validation run
        applicationValidationRunCheck(validationRunResponse, testCase, runId)
      }
    }
    // Run tests with our helper that handles test result tracking
    await runTestsAndRecordResults(dataFile, validateMessages)
  })
})
