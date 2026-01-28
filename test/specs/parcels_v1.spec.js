import request from 'supertest'
import { runTestsAndRecordResults } from '../utils/recordResults.js'
import { PARCELS_ENDPOINT, BEARER_TOKEN } from '../utils/apiEndpoints.js'
import {
  validateStatusCode,
  validateSuccessMessage,
  validateParcelsStructure,
  validateActionCode,
  validateAvailableArea,
  validateSizeUnit,
  validateSizeValue,
  validateErrorMessage
} from '../utils/parcelsHelper.js'

describe('Parcels V1 endpoint', () => {
  it('Should validate version1 parcels size, actions, available area taking existing agreements and planned actions into account', async () => {
    const dataFile = './test/data/parcelsData_v1.csv'

    // validating each test case
    const validateParcel = async (testCase, options = {}) => {
      const parcelIds = testCase.parcelIds.split(',')
      const fields = testCase.fields.split(',')

      // Make the real API request
      let response
      if (testCase.plannedActions) {
        const plannedActions = JSON.parse(testCase.plannedActions)
        response = await request(global.baseUrl)
          .post(PARCELS_ENDPOINT)
          .send({ parcelIds, fields, plannedActions })
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${BEARER_TOKEN}`)
          .set('x-api-key', `${process.env.API_KEY}`)
          .set('Accept-Encoding', '*')
      } else {
        response = await request(global.baseUrl)
          .post(PARCELS_ENDPOINT)
          .send({ parcelIds, fields })
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${BEARER_TOKEN}`)
          .set('x-api-key', `${process.env.API_KEY}`)
          .set('Accept-Encoding', '*')
      }

      // Validate basic status code match before other validations
      validateStatusCode(response, testCase)

      // For 200 responses, perform detailed validations
      if (response.status === 200) {
        // Validate success message
        validateSuccessMessage(response, testCase)
        // Validate parcel structure
        validateParcelsStructure(response, testCase)
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
    }
    // Run tests with our helper that handles test result tracking
    await runTestsAndRecordResults(dataFile, validateParcel)
  })
})
