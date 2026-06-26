import path from 'path'
import { transferResource } from '../../utils/ingestLandDataHelper.js'

jest.setTimeout(30 * 60 * 1000)

const parcelsDirectory = path.join(process.cwd(), 'test/land-data/land_parcels')

const ingestId = 563

describe('Land parcels ingest transfer endpoint', () => {
  it('should transfer the specified land parcel files to the dev environment', async () => {
    expect(ingestId).toBeTruthy()

    const filenamesToTransfer = [
      'reference_parcels_1.csv_dates_1.csv',
      'reference_parcels_1.csv_dates_2.csv',
      'reference_parcels_1.csv_dates_3.csv'
    ]

    const filesToTransfer = filenamesToTransfer.map((filename) =>
      path.join(parcelsDirectory, filename)
    )

    console.log(
      `Transferring ${filesToTransfer.length} parcel file(s) with ingestId ${ingestId}`
    )

    for (const filePath of filesToTransfer) {
      const filename = path.basename(filePath)
      await transferResource(
        filePath,
        'land_parcels',
        'dev',
        ingestId,
        filename
      )
    }
  })
})
