import request from 'supertest'
import { runTestsAndRecordResults } from '../../utils/recordResults.js'
import {
  APPLICATION_VALIDATIONS_ENDPOINT_V2,
  BEARER_TOKEN,
  API_KEY
} from '../../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage
} from '../../utils/validationsHelper.js'

describe('Validations V2 endpoint test with 100 land parcels', () => {
  it('should validate 3 actions each for 100 land parcels in the application', async () => {
    const dataFiles = [
      './test/data/sfi/validations/applicationsValidationsData_100_land_parcels.csv'
    ]

    const validateMessages = async (testCase, options = {}) => {
      const applicationId =
        testCase.applicationId && testCase.applicationId.trim() !== ''
          ? testCase.applicationId
          : `app-${Math.random().toString(36).substring(2, 10)}`
      const requester = testCase.requester
      const sbi =
        testCase.sbi && testCase.sbi.trim() !== '' ? testCase.sbi : '0123456789' // Default SBI if not provided
      const applicantCrn = testCase.applicantCrn
      const landActions = JSON.parse(testCase.landActions)

      // Make the API request to /application/validate endpoint
      const validationResponse = await request(global.baseUrl)
        .post(APPLICATION_VALIDATIONS_ENDPOINT_V2)
        .send({ applicationId, requester, sbi, applicantCrn, landActions })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', API_KEY || '')
        .set('Accept-Encoding', '*')
        .set('X-Forwarded-Authorization', 'TestToken')

      // Validate basic status code match before other validations
      validateStatusCode(
        validationResponse,
        testCase,
        'expectedValidationStatusCode'
      )

      // Validate success message
      validateSuccessMessage(
        validationResponse,
        testCase,
        'expectedValidationMessage'
      )
    }

    // Run tests with our helper that handles test result tracking
    for (const dataFile of dataFiles) {
      await runTestsAndRecordResults(dataFile, validateMessages)
    }
  })
})
