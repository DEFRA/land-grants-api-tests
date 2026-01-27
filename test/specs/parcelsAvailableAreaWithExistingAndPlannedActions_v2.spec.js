import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { PARCELS_ENDPOINT_V2, BEARER_TOKEN } from '../utils/apiEndpoints.js'
import { validateResponse } from '../utils/testRunnerHelper.js'
import {
  validateParcelFields,
  validateStatusCode,
  validateSuccessMessage,
  validateErrorMessage,
  validateParcelsStructure,
  validateActionCode,
  validateAvailableArea,
  validateSSSIConsentRequired
} from '../utils/parcelsHelper.js'

describe('Parcels V2 endpoint', () => {
  it('should validate version2 parcels available area taking existing agreements and planned actions into account', async () => {
    const dataFile =
      './test/data/parcelsAvailableAreaWithExistingAndPlannedActionsData_v2.csv'

    // validating each test case
    const validateParcel = async (testCase, options = {}) => {
      const parcelIds = testCase.parcelIds.split(',')
      const fields = testCase.fields.split(',')
      const plannedActions = JSON.parse(testCase.plannedActions)

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(PARCELS_ENDPOINT_V2)
        .send({ parcelIds, fields, plannedActions })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', `${process.env.API_KEY}`)
        .set('Accept-Encoding', '*')

      // // Validate basic status code match before other validations
      validateStatusCode(response, testCase)

      // For 200 responses, perform detailed validations
      if (response.status === 200) {
        // Validate success message
        validateSuccessMessage(response, testCase)
        // Validate parcel structure
        validateParcelsStructure(response, testCase)
        // Validate action code
        validateActionCode(response, testCase)
        // Validate available area value
        validateAvailableArea(response, testCase)
        // Validate SSSI Consent reuired field
        validateSSSIConsentRequired(response, testCase)
      } else {
        // Validate error message for non-200 responses
        validateErrorMessage(response, testCase)
      }

      // Validate the full response using our utility
      validateResponse(response, testCase, {
        customValidators: [validateParcelFields],
        allureReport: options.allureReport,
        throwOnError: true // Ensure errors are thrown to fail the test
      })

      return response
    }

    // Run tests with our helper that handles test result tracking
    await runTestsAndRecordResults(dataFile, validateParcel)
  })
})
