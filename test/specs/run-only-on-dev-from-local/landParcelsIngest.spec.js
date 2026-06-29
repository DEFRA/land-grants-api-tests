import request from 'supertest'
import path from 'path'
import { BEARER_TOKEN } from '../../utils/apiEndpoints.js'
import { transferResources } from '../../utils/ingestLandDataHelper.js'
import { generateIngestPayload } from './utils/generateIngestStartPayload.js'

jest.setTimeout(30 * 60 * 1000)

const parcelsDirectory = path.join(process.cwd(), 'test/land-data/land_parcels')

describe('Land parcels ingest transfer endpoint', () => {
  it('should start and transfer the parcel files to the dev environment', async () => {
    const payload = generateIngestPayload('test/land-data/land_parcels')
    const filenamesToTransfer = payload.files
      .map((file) => file.filename)
      .filter((filename) => filename.endsWith('.csv.zip'))
      .sort()

    const filesToTransfer = filenamesToTransfer.map((filename) =>
      path.join(parcelsDirectory, filename)
    )

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

    await transferResources(filesToTransfer, 'land_parcels', 'dev', ingestId)
  })
})
