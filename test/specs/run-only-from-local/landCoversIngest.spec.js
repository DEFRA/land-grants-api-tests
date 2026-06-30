import request from 'supertest'
import path from 'path'
import { BEARER_TOKEN } from '../../utils/apiEndpoints.js'
import { transferResources } from '../../utils/ingestLandDataHelper.js'
import { generateIngestPayload } from './utils/generateIngestStartPayload.js'

jest.setTimeout(30 * 60 * 1000)

const coversDirectory = path.join(process.cwd(), 'test/land-data/land_covers')
const payload = generateIngestPayload('test/land-data/land_covers')

// const payload = {
//   files: [
//     {
//       filename: 'land_covers_1.csv_dates_1.csv.zip',
//       rows: 45376
//     },
//     {
//       filename: 'land_covers_1.csv_dates_2.csv.zip',
//       rows: 46981
//     },
//     {
//       filename: 'land_covers_1.csv_dates_3.csv.zip',
//       rows: 23556
//     }
//   ]
// }

const filenamesToTransfer = payload.files
  .map((file) => file.filename)
  .filter((filename) => filename.endsWith('.csv.zip'))
  .sort()

const filesToTransfer = filenamesToTransfer.map((filename) =>
  path.join(coversDirectory, filename)
)

describe('Land covers ingest transfer endpoint', () => {
  it('should start and transfer the cover files to the dev environment', async () => {
    const startResponse = await request(global.baseUrl)
      .post('/ingest/land_covers/start')
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
      `Transferring ${filesToTransfer.length} cover file(s) with ingestId ${ingestId}`
    )

    await transferResources(filesToTransfer, 'land_covers', 'dev', ingestId)
  })
})
