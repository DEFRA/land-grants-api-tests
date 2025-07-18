import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { PARCELS_ENDPOINT } from '../utils/apiEndpoints.js'
import { validateResponse } from '../utils/testRunnerHelper.js'
import {
  validateParcelFields,
  validateStatusCode,
  validateSuccessMessage,
  validateErrorMessage,
  validateParcelsStructure,
  validateActionCode,
  validateAvailableArea
} from '../utils/parcelsHelper.js'
// import { cleanupAllure } from '../utils/allureHelper.js'

// Add afterAll hook to clean up resources
// afterAll(async () => {
//   await cleanupAllure()
// })

describe('Parcels endpoint', () => {
  it('should validate parcels available area taking existing agreements into account', async () => {
    const dataFile =
      './test/data/parcelsAvailableAreaWithExistingActionsData.csv'

    // validating each test case
    const validateParcel = async (testCase, options = {}) => {
      const parcelIds = testCase.parcelIds.split(',')
      const fields = testCase.fields.split(',')

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(PARCELS_ENDPOINT)
        .send({ parcelIds, fields })
        .set('Accept', 'application/json')

      // Validate basic status code match before other validations
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
