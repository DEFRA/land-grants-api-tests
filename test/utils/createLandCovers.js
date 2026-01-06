export async function createLandCovers(
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
  const inputPath = path.join(__dirname, '../base-land-data/covers/covers.csv')
  const outputDir = path.join(__dirname, '../land-data/covers')
  const outputPath = path.join(outputDir, 'covers_test.csv')

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
        // Update first four rows to make them unique
        if (rows.length > 0) {
          rows[0].SHEET_ID = SHEET_ID1
          rows[0].PARCEL_ID = PARCEL_ID1
          rows[0].ID = Math.floor(Date.now() / 1000)
          rows[1].SHEET_ID = SHEET_ID1
          rows[1].PARCEL_ID = PARCEL_ID1
          rows[1].ID = rows[0].ID + 1
          rows[2].SHEET_ID = SHEET_ID1
          rows[2].PARCEL_ID = PARCEL_ID1
          rows[2].ID = rows[1].ID + 1
          rows[3].SHEET_ID = SHEET_ID1
          rows[3].PARCEL_ID = PARCEL_ID1
          rows[3].ID = rows[2].ID + 1
          rows[4].SHEET_ID = SHEET_ID2
          rows[4].PARCEL_ID = PARCEL_ID2
        }

        // Write updated CSV
        const csvWriter = createObjectCsvWriter({
          path: outputPath,
          header: [
            { id: 'geom', title: 'geom' },
            { id: 'SHEET_ID', title: 'SHEET_ID' },
            { id: 'PARCEL_ID', title: 'PARCEL_ID' },
            { id: 'VALID_FROM', title: 'VALID_FROM' },
            { id: 'VALID_TO', title: 'VALID_TO' },
            { id: 'ID', title: 'ID' },
            { id: 'REFERENCE_PARCELS_ID', title: 'REFERENCE_PARCELS_ID' },
            { id: 'LAND_COVER_CLASS_CODE', title: 'LAND_COVER_CLASS_CODE' },
            { id: 'GEOM_AREA_SQM', title: 'GEOM_AREA_SQM' },
            { id: 'VERIFIED_ON', title: 'VERIFIED_ON' },
            { id: 'VERIFICATION_TYPE', title: 'VERIFICATION_TYPE' },
            { id: 'CREATED_ON', title: 'CREATED_ON' },
            { id: 'CREATED_BY', title: 'CREATED_BY' },
            { id: 'LINEAR_FEATURE', title: 'LINEAR_FEATURE' },
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
