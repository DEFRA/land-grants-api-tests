import path from 'path'
import { readdirSync } from 'fs'

export function generateIngestPayload(dataDirectory) {
  const directory = path.resolve(process.cwd(), dataDirectory)
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.csv'))
    .map((entry) => ({
      filename: entry.name,
      rows: 1000
    }))

  return { files }
}
