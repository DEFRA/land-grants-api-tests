import fs from 'fs'
import csv from 'csv-parser'
import path from 'path'

/**
 * Reads data from a CSV file and returns an array of objects
 */
export const readCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = []
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`))
      return
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log(
          `Read ${results.length} records from ${path.basename(filePath)}`
        )
        resolve(results)
      })
      .on('error', (err) => {
        console.error(`Error reading CSV file: ${err.message}`)
        reject(err)
      })
  })
}
