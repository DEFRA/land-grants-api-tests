import request from 'supertest'
import path from 'path'
import { BEARER_TOKEN } from '../../utils/apiEndpoints.js'
import { transferResources } from '../../utils/ingestLandDataHelper.js'
import { generateIngestPayload } from './utils/generateIngestStartPayload.js'

jest.setTimeout(30 * 60 * 1000)
const targetEnvironment = process.env.ENVIRONMENT || 'dev'

const parcelsDirectory = path.join(process.cwd(), 'test/land-data/land_parcels')
const payload = generateIngestPayload('test/land-data/land_parcels')

// const payload = {
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

const filenamesToTransfer = payload.files
  .map((file) => file.filename)
  .filter((filename) => filename.endsWith('.csv.zip'))
  .sort()

const filesToTransfer = filenamesToTransfer.map((filename) =>
  path.join(parcelsDirectory, filename)
)

describe('Land parcels ingest transfer endpoint', () => {
  it(`should start and transfer the parcel files to the ${targetEnvironment} environment`, async () => {
    const startResponse = await request(global.baseUrl)
      .post('/ingest/land_parcels/start')
      .send(payload)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${BEARER_TOKEN}`)
      .set('x-api-key', process.env.API_KEY)
      .set('Accept-Encoding', '*')

    expect([200]).toContain(startResponse.status)
    expect(startResponse.body).toHaveProperty('ingestId')

    const ingestId = startResponse.body.ingestId
    expect(ingestId).toBeTruthy()

    console.log(
      `Transferring ${filesToTransfer.length} parcel file(s) with ingestId ${ingestId}`
    )

    await transferResources(
      filesToTransfer,
      'land_parcels',
      targetEnvironment,
      ingestId
    )
  })
})
