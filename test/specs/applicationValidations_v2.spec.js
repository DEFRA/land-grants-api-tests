import request from 'supertest'
import { debugLog } from '../utils/debugLogger.js'
import { runTestsAndRecordResultsForFiles } from '../utils/recordResults.js'
import {
  APPLICATION_VALIDATIONS_ENDPOINT_V2,
  CM_APPLICATION_VALIDATION_RUN_ENDPOINT,
  CM_APPLICATION_VALIDATION_RERUN_ENDPOINT,
  BEARER_TOKEN,
  API_KEY
} from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  validateErrorMessage,
  validateApplicationRules,
  applicationReRunValidationCheck
} from '../utils/validationsHelper.js'

describe('Validations V2 endpoint', () => {
  it('should validate land actions in the application', async () => {
    const dataFiles = [
      './test/data/sfi/validations/applicationsValidationsData_CMOR1,UPL1_26,UPL2_26andUPL3_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_UPL8_26andUPL10_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_CLIG3_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_CSAM3_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_SCR2_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_WBD1_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_CNUM2_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_HEF1_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_BND1_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_BND2_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_GRH12_26_v2.csv',
      './test/data/sfi/validations/applicationsValidationsData_CHRW2_26_v2.csv'
    ]

    const validateMessages = async (testCase, options = {}) => {
      const applicationId =
        testCase.applicationId && testCase.applicationId.trim() !== ''
          ? testCase.applicationId
          : `app-${Math.random().toString(36).substring(2, 10)}`
      const requester = testCase.requester
      const sbi =
        testCase.sbi && testCase.sbi.trim() !== '' ? testCase.sbi : '800000001' // Default SBI if not provided
      const applicantCrn =
        testCase.applicantCrn?.trim() !== ''
          ? testCase.applicantCrn
          : '9000000001' // Default CRN if not provided
      const landActions = JSON.parse(testCase.landActions)

      const validationRequestPayload = {
        applicationId,
        requester,
        sbi,
        applicantCrn,
        landActions
      }

      debugLog('Application validation request:', validationRequestPayload)

      // Make the API request to /application/validate endpoint
      const validationResponse = await request(global.baseUrl)
        .post(APPLICATION_VALIDATIONS_ENDPOINT_V2)
        .send(validationRequestPayload)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', API_KEY || '')
        .set('Accept-Encoding', '*')
        .set('X-Forwarded-Authorization', 'TestToken')

      debugLog('Application validation response:', {
        status: validationResponse.status,
        body: validationResponse.body
      })
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

        // Extract the runId from the validation response
        const runId = validationResponse.body.id

        // Make the GET API request to /case-management-adapter/application/validation-run/{id} endpoint
        const cmValidationRunResponse = await request(global.baseUrl)
          .get(CM_APPLICATION_VALIDATION_RUN_ENDPOINT + `/${runId}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${BEARER_TOKEN}`)
          .set('x-api-key', API_KEY || '')
          .set('Accept-Encoding', '*')

        // Validate the status code of the CM validation run response
        validateStatusCode(cmValidationRunResponse, 200)

        // Make the POST API request to /case-management-adapter/application/validation-run/rerun/{id} endpoint
        const cmReRunValidationPayload = {
          requesterUsername: 'TestUser',
          id: runId
        }

        const cmReRunValidationResponse = await request(global.baseUrl)
          .post(CM_APPLICATION_VALIDATION_RERUN_ENDPOINT)
          .send(cmReRunValidationPayload)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${BEARER_TOKEN}`)
          .set('x-api-key', API_KEY || '')
          .set('Accept-Encoding', '*')
          .set('Defra-Email', 'testuser@example.com')

        // Validate the status code of the CM validation run response
        validateStatusCode(cmReRunValidationResponse, 200)

        // For 200 responses, perform detailed validations
        if (cmReRunValidationResponse.status === 200) {
          // Validate success message
          validateSuccessMessage(
            cmReRunValidationResponse,
            testCase,
            'expectedValidationRunMessage'
          )

          // validate application re-run response
          applicationReRunValidationCheck(cmReRunValidationResponse, testCase)
        }
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
    await runTestsAndRecordResultsForFiles(dataFiles, validateMessages)
  })
})
