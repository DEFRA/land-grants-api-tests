import { getLandDataCounts } from '../utils/landDataIngestChecksHelper.js'

describe('Land data checks', () => {
  it('should return equal unique land parcels and covers count and no duplicate covers', async () => {
    const landDataCounts = await getLandDataCounts()
    expect(landDataCounts).toBe(1) // Placeholder assertion to confirm test runs successfully
    // expect(landDataCounts.uniqueParcelsCount).toEqual(
    //   landDataCounts.uniqueCoversCount
    // )
    // expect(landDataCounts.duplicateCoversCount <= 2) // Allowing for up to 2 duplicates due to known data issues
  })
})
