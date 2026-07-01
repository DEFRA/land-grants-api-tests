import path from 'path'
import { transferResources } from '../../utils/ingestLandDataHelper.js'

jest.setTimeout(30 * 60 * 1000)
const targetEnvironment = process.env.ENVIRONMENT || 'dev'

const agreementsDirectory = path.join(
  process.cwd(),
  'test/land-data/agreements'
)
const agreementsFile = path.join(agreementsDirectory, 'agreements.csv')
const filesToTransfer = [agreementsFile]

describe('Agreements transfer endpoint', () => {
  it(`should transfer agreement file(s) to the ${targetEnvironment} environment without start ingest`, async () => {
    console.log(`Transferring ${filesToTransfer.length} agreement file(s)`)

    await transferResources(
      filesToTransfer,
      'agreements',
      targetEnvironment,
      undefined
    )
  })
})
