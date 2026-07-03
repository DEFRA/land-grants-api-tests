import 'dotenv/config'
import {
  ingestSpecs,
  localAndNonLocalSharedSpecs,
  excludeSpecs
} from './test/specGroups.js'

const allSpecs = ['**/*.spec.js']
const localTargetEnvironments = new Set([
  'dev',
  'test',
  'perf-test',
  'ext-test'
])

export function getSpecsForEnv(
  env = process.env.ENVIRONMENT,
  runEnv = process.env.RUN_ENV,
  testScope = process.env.TEST_SCOPE
) {
  const environment = (env || '').toLowerCase()
  const runEnvironment = (runEnv || '').toLowerCase()
  const scope = `${testScope || ''}`.trim().toLowerCase()

  if (scope === 'ingest') {
    // Jest matches testMatch against full paths; prefixing with **/ keeps explicit file matches reliable.
    return ingestSpecs.map((spec) => `**/${spec}`)
  }

  if (
    environment !== 'local' &&
    runEnvironment === 'local' &&
    localTargetEnvironments.has(environment)
  ) {
    return [
      ...allSpecs,
      ...excludeSpecs(ingestSpecs),
      ...excludeSpecs(localAndNonLocalSharedSpecs)
    ]
  }

  if (environment === 'local' && runEnvironment === 'local') {
    return [...allSpecs, ...excludeSpecs(ingestSpecs)]
  }

  return [...allSpecs, ...excludeSpecs(ingestSpecs)]
}
