import request from 'supertest'
import { readdirSync } from 'fs'
import path from 'path'
import { BEARER_TOKEN } from '../../utils/apiEndpoints.js'
import { transferResources } from '../../utils/ingestLandDataHelper.js'
import { generateIngestPayload } from './utils/generateIngestStartPayload.js'

jest.setTimeout(30 * 60 * 1000)

const coversDirectory = path.join(process.cwd(), 'test/land-data/land_covers')

const filenamesToTransfer = readdirSync(coversDirectory, {
  withFileTypes: true
})
  .filter((entry) => entry.isFile() && entry.name.endsWith('.csv.zip'))
  .map((entry) => entry.name)
  .sort()

const filesToTransfer = filenamesToTransfer.map((filename) =>
  path.join(coversDirectory, filename)
)

describe('Land covers ingest transfer endpoint', () => {
  it('should start and transfer the cover files to the dev environment', async () => {
    const payload = generateIngestPayload('test/land-data/land_covers')

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
