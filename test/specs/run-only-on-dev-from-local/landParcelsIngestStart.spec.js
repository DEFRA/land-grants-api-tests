import request from 'supertest'
import { BEARER_TOKEN } from '../../utils/apiEndpoints.js'
import { generateIngestPayload } from './utils/generateIngestStartPayload.js'

jest.setTimeout(30 * 60 * 1000)

describe('Land parcels ingest start endpoint', () => {
  const payload = generateIngestPayload('test/land-data/land_parcels')
  // {
  //   files: [
  //     {
  //       filename: 'reference_parcels_1.csv_dates_1.csv.zip',
  //       rows: 36062
  //     },
  //     {
  //       filename: 'reference_parcels_1.csv_dates_2.csv.zip',
  //       rows: 33259
  //     },
  //     {
  //       filename: 'reference_parcels_1.csv_dates_3.csv.zip',
  //       rows: 3899
  //     }
  //   ]
  // }

  console.log('payload:', payload)

  it('should start land parcels ingest with the provided file inventory', async () => {
    const response = await request(global.baseUrl)
      .post('/ingest/land_parcels/start')
      .send(payload)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${BEARER_TOKEN}`)
      .set('x-api-key', process.env.API_KEY)
      .set('Accept-Encoding', '*')

    expect([200]).toContain(response.status)
    expect(response.body).toHaveProperty('ingestId')

    console.log(`Started ingest with ingestId: ${response.body.ingestId}`)
  })
})
