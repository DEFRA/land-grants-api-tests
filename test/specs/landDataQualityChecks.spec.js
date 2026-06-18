import request from 'supertest'
import { STATS_ENDPOINT, BEARER_TOKEN } from '../utils/apiEndpoints.js'

describe('LAND DATA QUALITY CHECKS', () => {
  it('validates the expected land data quality summary counts', async () => {
    const response = await request(global.baseUrl)
      .get(STATS_ENDPOINT)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${BEARER_TOKEN}`)
      .set('x-api-key', process.env.API_KEY)
      .set('Accept-Encoding', '*')
      .expect(200)

    const {
      uniqueParcelsCount,
      uniqueCoversCount,
      duplicateCoversCount,
      unlinkedParcelsCount,
      unlinkedCoversCount
    } = response.body

    expect(Number(uniqueParcelsCount)).toBe(Number(uniqueCoversCount))
    expect(Number(duplicateCoversCount)).toBe(2) // due to known data issues with source land data
    expect(Number(unlinkedParcelsCount)).toBe(0)
    expect(Number(unlinkedCoversCount)).toBe(0)
  })
})
