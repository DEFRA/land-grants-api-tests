import { transferResource } from '../utils/ingest-land-data-qa.js'
import { createLandParcels } from '../utils/create-land-parcels.js'

describe('Land data ingest', () => {
  it('should validate land parcels ingested', async () => {
    // create land parcels
    await createLandParcels()

    // transfer a land parcels file to the dev environment
    const dataFile = 'test/land-data/parcels/parcel_test.csv'
    await transferResource(dataFile, 'land_parcels', 'dev')
  })
})
