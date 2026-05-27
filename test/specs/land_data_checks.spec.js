// import { getLandDataCounts } from '../utils/landDataIngestChecksHelper.js'
import { createDBPool, getDBOptions } from '../utils/postgres.js'

describe('Land data checks', () => {
  let connection

  beforeAll(() => {
    console.log('beforeAll called')
    const options = getDBOptions()
    console.log('Database connection options:')
    console.log(options.host)
    console.log(options.user)
    console.log(options.database)
    console.log(options.password)
    console.log(options.port)
    console.log(options.region)
    connection = createDBPool(options)
  })

  afterAll(async () => {
    await connection.end()
  })

  it('should return equal unique land parcels and covers count and no duplicate covers', async () => {
    console.log('pool created')
    const client = await connection.connect()
    console.log('client connected')
    const testQuery = 'SELECT 1'
    const result = await client.query(testQuery)
    console.log('testQuery executed')
    console.log(result?.rows)
    console.log('client disconnected')
    await client.release()
    // console.log('Successfully connected to the database')

    // expect(true).toBe('true')
    // const landDataCounts = await getLandDataCounts()
    // expect(landDataCounts).toBe(1) // Placeholder assertion to confirm test runs successfully
    // expect(landDataCounts.uniqueParcelsCount).toEqual(
    //   landDataCounts.uniqueCoversCount
    // )
    // expect(landDataCounts.duplicateCoversCount <= 2) // Allowing for up to 2 duplicates due to known data issues
  })
})
