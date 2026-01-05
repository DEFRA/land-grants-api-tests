export async function createLandParcels() {
  const fs = require('fs')
  const path = require('path')
  const csv = require('csv-parser')
  const { createObjectCsvWriter } = require('csv-writer')

  // Get current date and time
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const yy = String(now.getFullYear()).slice(-2)
  const ddmmyy = dd + mm + yy
  const hhmm =
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0')

  // Input and output paths
  const inputPath = path.join(
    __dirname,
    '../base-land-data/parcels/parcel_test.csv'
  )
  const outputDir = path.join(__dirname, '../land-data/parcels')
  const outputPath = path.join(outputDir, 'parcel_test.csv')

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Read and parse CSV
  const rows = []
  fs.createReadStream(inputPath)
    .pipe(csv())
    .on('data', (row) => {
      rows.push(row)
    })
    .on('end', () => {
      // Update first row (assuming header is not included in rows)
      if (rows.length > 0) {
        // rows[0].ID = randomUUID(); // Uncomment if unique ID is needed
        rows[0].SHEET_ID = ddmmyy
        rows[0].PARCEL_ID = hhmm
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
        })
        .catch((err) => {
          console.error('Error writing CSV:', err)
        })
    })
}
