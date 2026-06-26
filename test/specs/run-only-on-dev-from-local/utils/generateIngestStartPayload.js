import path from 'path'
import { readFileSync, readdirSync } from 'fs'
import { spawnSync } from 'child_process'

function countRowsFromCsvContent(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0)

  if (lines.length === 0) {
    return 0
  }

  // Exclude CSV header row.
  return Math.max(lines.length - 1, 0)
}

function countRowsFromCsvFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  return countRowsFromCsvContent(content)
}

function countRowsFromZipFile(filePath) {
  const listResult = spawnSync('unzip', ['-Z1', filePath], {
    encoding: 'utf8'
  })

  if (listResult.status !== 0) {
    throw new Error(
      `Failed to list zip entries for ${filePath}: ${listResult.stderr || 'unknown error'}`
    )
  }

  const csvEntry = listResult.stdout
    .split(/\r?\n/)
    .find((entry) => entry && !entry.endsWith('/') && entry.endsWith('.csv'))

  if (!csvEntry) {
    throw new Error(`No CSV entry found in zip file: ${filePath}`)
  }

  const readResult = spawnSync('unzip', ['-p', filePath, csvEntry], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 200
  })

  if (readResult.status !== 0) {
    throw new Error(
      `Failed to read CSV from zip file ${filePath}: ${readResult.stderr || 'unknown error'}`
    )
  }

  return countRowsFromCsvContent(readResult.stdout)
}

export function generateIngestPayload(dataDirectory) {
  const directory = path.resolve(process.cwd(), dataDirectory)
  const entries = readdirSync(directory, { withFileTypes: true }).filter(
    (entry) => entry.isFile()
  )

  const hasCsvFiles = entries.some((entry) => entry.name.endsWith('.csv'))
  const hasZipFiles = entries.some((entry) => entry.name.endsWith('.zip'))

  const acceptedExtensions = hasCsvFiles
    ? ['.csv']
    : hasZipFiles
      ? ['.zip']
      : ['.csv', '.zip']

  const files = entries
    .filter((entry) =>
      acceptedExtensions.some((extension) => entry.name.endsWith(extension))
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      filename: entry.name,
      rows: entry.name.endsWith('.zip')
        ? countRowsFromZipFile(path.join(directory, entry.name))
        : countRowsFromCsvFile(path.join(directory, entry.name))
    }))

  return { files }
}
