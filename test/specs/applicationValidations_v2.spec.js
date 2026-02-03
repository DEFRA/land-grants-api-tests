import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import {
  APPLICATION_VALIDATIONS_ENDPOINT_V2,
  BEARER_TOKEN
} from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  validateErrorMessage,
  validateApplicationRules
} from '../utils/validationsHelper.js'

describe('Validations V2 endpoint', () => {
  it('should validate land actions in the application', async () => {
    const dataFile = './test/data/applicationsValidationsData_v2.csv'

    const validateMessages = async (testCase, options = {}) => {
      const applicationId = testCase.applicationId
      const requester = testCase.requester
      const sbi = testCase.sbi
      const applicantCrn = testCase.applicantCrn
      const landActions = JSON.parse(testCase.landActions)

      // Make the API request to /application/validate endpoint
      const validationResponse = await request(global.baseUrl)
        .post(APPLICATION_VALIDATIONS_ENDPOINT_V2)
        .send({ applicationId, requester, sbi, applicantCrn, landActions })
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

        // validate application validation response
        validateApplicationRules(validationResponse, testCase)

        // // Extract the runId from the validation response
        // const runId = validationResponse.body.id

        // // Make the API request to /application/validation-run/{id} endpoint
        // const validationRunResponse = await request(global.baseUrl)
        //   .post(APPLICATION_VALIDATION_RUN_ENDPOINT + `/${runId}`)
        //   .set('Accept', 'application/json')
        //   .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        //   .set('x-api-key', `${process.env.API_KEY}`)
        //   .set('Accept-Encoding', '*')

        // // Validate basic status code match before other validations
        // validateStatusCode(
        //   validationRunResponse,
        //   testCase,
        //   'expectedValidationRunStatusCode'
        // )

        // // For 200 responses, perform detailed validations
        // if (validationRunResponse.status === 200) {
        //   // Validate success message
        //   validateSuccessMessage(
        //     validationRunResponse,
        //     testCase,
        //     'expectedValidationRunMessage'
        //   )

        //   // validate application validation run
        //   applicationValidationRunCheck(validationRunResponse, testCase, runId)
        // }
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
