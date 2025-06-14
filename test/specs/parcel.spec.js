import request from 'supertest'
import { validateResponse } from '../utils/testRunnerHelper.js'
import { runTestsAndRecordResults } from '../utils/recordResults'
import { PARCELS_ENDPOINT } from '../utils/apiEndpoints'
import {
  validateParcelFields,
  validateStatusCode,
  validateSuccessMessage,
  validateErrorMessage,
  validateParcelStructure,
  validateSizeUnit,
  validateSizeValue,
  validateActionCode,
  validateAvailableArea
} from '../utils/parcelHelper'
import { cleanupAllure } from '../utils/allureHelper'

// Add afterAll hook to clean up resources
afterAll(async () => {
  await cleanupAllure()
})

describe('Parcels endpoint', () => {
  it('should validate parcels from CSV data', async () => {
    const dataFile = './test/data/parcelData.csv'

    // Validate a single parcel test case
    const validateParcel = async (testCase, options = {}) => {
      const { sheetId, parcelId } = testCase
      const parcelIdentifier = `${sheetId}-${parcelId}`

      // Make the real API request
      const response = await request(global.baseUrl)
        .get(`${PARCELS_ENDPOINT}/${parcelIdentifier}`)
        .set('Accept', 'application/json')
      // Validate basic status code match before other validations
      validateStatusCode(response, testCase)

      // For 200 responses, perform detailed validations
      if (response.status === 200) {
        // Validate success message
        validateSuccessMessage(response, testCase)
        // Validate parcel structure
        validateParcelStructure(response)
        // Validate size unit
        validateSizeUnit(response, testCase)
        // Validate size value
        validateSizeValue(response, testCase)
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

describe('Parcels endpoint', () => {
  it('should validate individual parcels when not passed as csv data', async () => {
    const res = await request(global.baseUrl)
      .get(`${PARCELS_ENDPOINT}/SD6743-6006`)
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

    expect(res.body.message).toEqual('success')
    expect(res.body.parcel.parcelId).toEqual('6006')
    expect(res.body.parcel.sheetId).toEqual('SD6743')
  })
})
