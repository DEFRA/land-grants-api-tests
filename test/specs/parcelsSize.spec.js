import request from 'supertest'
import { validateResponse } from '../utils/testRunnerHelper.js'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { PARCELS_ENDPOINT, BEARER_TOKEN } from '../utils/apiEndpoints.js'
import {
  validateParcelFields,
  validateStatusCode,
  validateSuccessMessage,
  validateErrorMessage,
  validateParcelsStructure,
  validateSizeUnit,
  validateSizeValue
} from '../utils/parcelsHelper.js'
// import { cleanupAllure } from '../utils/allureHelper.js'

// Add afterAll hook to clean up resources
// afterAll(async () => {
//   await cleanupAllure()
// })

describe('Parcels endpoint', () => {
  it('should validate parcels size from CSV data', async () => {
    const dataFile = './test/data/parcelsSizeData.csv'

    // validating each test case
    const validateParcels = async (testCase, options = {}) => {
      const parcelIds = testCase.parcelIds.split(',')
      const fields = testCase.fields.split(',')

      // Make the real API request
      const response = await request(global.baseUrl)
        .post(PARCELS_ENDPOINT)
        .send({ parcelIds, fields })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN}`)
        .set('x-api-key', `${process.env.API_KEY}`)
        .set('Accept-Encoding', '*')

      // Validate basic status code match before other validations
      validateStatusCode(response, testCase)

      // For 200 responses, perform detailed validations
      if (response.status === 200) {
        // Validate success message
        validateSuccessMessage(response, testCase)
        // Validate parcels structure
        validateParcelsStructure(response, testCase)
        // Validate size unit
        validateSizeUnit(response, testCase)
        // Validate size value
        validateSizeValue(response, testCase)
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
    await runTestsAndRecordResults(dataFile, validateParcels)
  })
})
