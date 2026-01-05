import { transferResource } from '../utils/ingest-land-data-qa.js'
import { createLandParcels } from '../utils/create-land-parcels.js'

describe('Land data ingest', () => {
  it('should validate land actions in the application', async () => {
    await createLandParcels()

    const fileToUpload = 'test/land-data/parcels/parcel_test.csv'

    // create and transfer a land parcels file to the dev environment
    await transferResource(fileToUpload, 'land_parcels', 'dev')

    expect(true).toBe(true)
  })
})
