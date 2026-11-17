import request from 'supertest'
import { runTestsAndRecordResultsForFiles } from '../utils/recordResults.js'
import { debugLog } from '../utils/debugLogger.js'
import {
  API_KEY,
  BEARER_TOKEN,
  PARCEL_SUPPLEMENTS_ENDPOINT_V2
} from '../utils/apiEndpoints.js'

describe('Parcel supplements V2 endpoint', () => {
  it('should validate parcel supplements', async () => {
    const dataFiles = [
      './test/data/sfi/supplements/supplementsData_GRH7_26_v2.csv',
      './test/data/sfi/supplements/supplementsData_GRH8_26_v2.csv',
      './test/data/sfi/supplements/supplementsData_generic_v2.csv'
    ]

    const validateSupplement = async (testCase) => {
      const payload = {
        parcelId: testCase.parcelId,
        baseAction: {
          actionCode: testCase.baseActionCode,
          quantity: Number(testCase.baseActionQuantity),
          unit: testCase.baseActionUnit
        }
      }

      if (testCase.selectedSupplements?.trim()) {
        payload.selectedSupplements = JSON.parse(testCase.selectedSupplements)
      }

      debugLog('Parcel supplements API request:', {
        method: 'POST',
        endpoint: PARCEL_SUPPLEMENTS_ENDPOINT_V2,
        payload
      })

      const response = await request(global.baseUrl)
        .post(PARCEL_SUPPLEMENTS_ENDPOINT_V2)
        .send(payload)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${BEARER_TOKEN || ''}`)
        .set('x-api-key', API_KEY || '')
        .set('Accept-Encoding', '*')
        .set('X-Forwarded-Authorization', 'TestToken')

      debugLog('Parcel supplements API response:', {
        status: response.status,
        body: response.body
      })

      expect(response.status).toBe(Number(testCase.expectedStatusCode))
      expect(response.body.message).toBe(testCase.expectedMessage)

      if (response.status !== 200) {
        return
      }

      expect(response.body).toEqual(
        expect.objectContaining({
          parcelId: testCase.expectedParcelId,
          sheetId: testCase.expectedSheetId,
          baseActionCode: testCase.expectedBaseActionCode
        })
      )
      if (!testCase.expectedSupplementCode) {
        return
      }

      expect(response.body.supplements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ code: testCase.expectedSupplementCode })
        ])
      )

      const supplement = response.body.supplements.find(
        (action) => action.code === testCase.expectedSupplementCode
      )
      expect(supplement).toEqual(
        expect.objectContaining({
          availability: {
            unit: testCase.expectedAvailabilityUnit,
            value: Number(testCase.expectedAvailabilityValue)
          },
          isAvailable: testCase.expectedIsAvailable.toLowerCase() === 'true'
        })
      )
    }

    await runTestsAndRecordResultsForFiles(dataFiles, validateSupplement)
  })
})
