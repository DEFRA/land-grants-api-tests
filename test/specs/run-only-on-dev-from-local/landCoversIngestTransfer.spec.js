import path from 'path'
import { transferResource } from '../../utils/ingestLandDataHelper.js'

jest.setTimeout(30 * 60 * 1000)

const coversDirectory = path.join(process.cwd(), 'test/land-data/land_covers')

const ingestId = 562

describe('Land covers ingest transfer endpoint', () => {
  it('should transfer the specified land cover files to the dev environment', async () => {
    expect(ingestId).toBeTruthy()

    const filenamesToTransfer = [
      'land_covers_1.csv_dates_1.csv',
      'land_covers_1.csv_dates_2.csv',
      'land_covers_1.csv_dates_3.csv'
    ]

    const filesToTransfer = filenamesToTransfer.map((filename) =>
      path.join(coversDirectory, filename)
    )

    console.log(
      `Transferring ${filesToTransfer.length} cover file(s) with ingestId ${ingestId}`
    )

    for (const filePath of filesToTransfer) {
      const filename = path.basename(filePath)
      await transferResource(filePath, 'land_covers', 'dev', ingestId, filename)
    }
  })
})
