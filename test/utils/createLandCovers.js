import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import JSZip from 'jszip'
import { createObjectCsvWriter } from 'csv-writer'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Input and output paths
const inputPath = path.join(__dirname, '../base-land-data/covers/covers.csv')
const outputDir = path.join(__dirname, '../land-data/covers')
const outputCsvPath = path.join(outputDir, 'covers_test.csv')
const outputZipPath = path.join(outputDir, 'covers_test.zip')

async function createZipFromCsv(csvPath, zipPath, entryName) {
  await fs.promises.mkdir(path.dirname(zipPath), { recursive: true })

  const csvData = await fs.promises.readFile(csvPath)
  const zip = new JSZip()
  zip.file(entryName, csvData)

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  })

  await fs.promises.writeFile(zipPath, buffer)
}

export async function createLandCovers(
  SHEET_ID1,
  PARCEL_ID1,
  SHEET_ID2,
  PARCEL_ID2
) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Read and parse CSV
  const rows = []
  await new Promise((resolve, reject) => {
    fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (row) => {
        rows.push(row)
      })
      .on('end', resolve)
      .on('error', reject)
  })

  // Update first four rows to make them unique
  if (rows.length > 0) {
    rows[0].SHEET_ID = SHEET_ID1
    rows[0].PARCEL_ID = PARCEL_ID1
    rows[0].ID = Math.floor(Date.now() / 1000)
  }
  if (rows.length > 1) {
    rows[1].SHEET_ID = SHEET_ID1
    rows[1].PARCEL_ID = PARCEL_ID1
    rows[1].ID = rows[0].ID + 1
  }
  if (rows.length > 2) {
    rows[2].SHEET_ID = SHEET_ID1
    rows[2].PARCEL_ID = PARCEL_ID1
    rows[2].ID = rows[1].ID + 1
  }
  if (rows.length > 3) {
    rows[3].SHEET_ID = SHEET_ID1
    rows[3].PARCEL_ID = PARCEL_ID1
    rows[3].ID = rows[2].ID + 1
  }
  if (rows.length > 4) {
    rows[4].SHEET_ID = SHEET_ID2
    rows[4].PARCEL_ID = PARCEL_ID2
  }

  // Write updated CSV temporarily so we can compress it into a zip file
  const csvWriter = createObjectCsvWriter({
    path: outputCsvPath,
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

  await csvWriter.writeRecords(rows)

  // Compress the CSV into a ZIP archive and write csv and zip files to output directory
  await createZipFromCsv(outputCsvPath, outputZipPath, 'covers_test.csv')
  console.log('ZIP written to', outputZipPath)
  console.log('CSV written to', outputCsvPath)
  return { zipPath: outputZipPath, csvPath: outputCsvPath }
}
