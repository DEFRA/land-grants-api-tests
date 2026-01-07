export async function createLandParcels(
  SHEET_ID1,
  PARCEL_ID1,
  SHEET_ID2,
  PARCEL_ID2
) {
  const fs = require('fs')
  const path = require('path')
  const csv = require('csv-parser')
  const { createObjectCsvWriter } = require('csv-writer')

  // Input and output paths
  const inputPath = path.join(
    __dirname,
    '../base-land-data/parcels/parcels.csv'
  )
  const outputDir = path.join(__dirname, '../land-data/parcels')
  const outputPath = path.join(outputDir, 'parcels_test.csv')

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  return new Promise((resolve, reject) => {
    // Read and parse CSV
    const rows = []
    fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row)
      })
      .on('end', () => {
        // Update first row to make it unique
        if (rows.length > 0) {
          rows[0].SHEET_ID = SHEET_ID1
          rows[0].PARCEL_ID = PARCEL_ID1
          rows[1].SHEET_ID = SHEET_ID2
          rows[1].PARCEL_ID = PARCEL_ID2
        }

        // Write updated CSV
        const csvWriter = createObjectCsvWriter({
          path: outputPath,
          header: [
            { id: 'geom', title: 'geom' },
            { id: 'ID', title: 'ID' },
            { id: 'SHEET_ID', title: 'SHEET_ID' },
            { id: 'PARCEL_ID', title: 'PARCEL_ID' },
            { id: 'VALID_FROM', title: 'VALID_FROM' },
            { id: 'VALID_TO', title: 'VALID_TO' },
            { id: 'GEOM_AREA_SQM', title: 'GEOM_AREA_SQM' },
            { id: 'VERIFIED_ON', title: 'VERIFIED_ON' },
            { id: 'VERIFICATION_TYPE', title: 'VERIFICATION_TYPE' },
            { id: 'CREATED_ON', title: 'CREATED_ON' },
            { id: 'CREATED_BY', title: 'CREATED_BY' },
            { id: 'VALIDATED', title: 'VALIDATED' },
            { id: 'CENTROID_X', title: 'CENTROID_X' },
            { id: 'CENTROID_Y', title: 'CENTROID_Y' },
            { id: 'LAST_REFRESH_DATE', title: 'LAST_REFRESH_DATE' }
          ]
        })

        csvWriter
          .writeRecords(rows)
          .then(() => {
            console.log('CSV updated and written to', outputPath)
            resolve()
          })
          .catch((err) => {
            console.error('Error writing CSV:', err)
            reject(err)
          })
      })
  })
}
