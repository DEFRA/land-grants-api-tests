import request from 'supertest'
import { BEARER_TOKEN } from '../../utils/apiEndpoints.js'
import { generateIngestPayload } from './utils/generateIngestStartPayload.js'

jest.setTimeout(30 * 60 * 1000)

describe('Land covers ingest start endpoint', () => {
  const payload = generateIngestPayload('test/land-data/land_covers')
  // {
  //   files: [
  //     {
  //       filename: 'land_covers_1.csv_dates_1.csv',
  //       rows: 45376
  //     },
  //     {
  //       filename: 'land_covers_1.csv_dates_2.csv',
  //       rows: 46981
  //     },
  //     {
  //       filename: 'land_covers_1.csv_dates_3.csv',
  //       rows: 23556
  //     }
  //   ]
  // }

  it('should start land covers ingest with the provided file inventory', async () => {
    const response = await request(global.baseUrl)
      .post('/ingest/land_covers/start')
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
