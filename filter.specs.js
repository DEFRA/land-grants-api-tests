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

  // GSPS-635 :  Files to skip specifically when running against the 'test' environment
  const skipInTest = [
    'test/specs/parcels_v2.spec.js',
    'test/specs/applicationValidations_v2.spec.js'
  ]

  if (scope === 'ingest') {
    // Jest matches testMatch against full paths; prefixing with **/ keeps explicit file matches reliable.
    let specs = ingestSpecs.map((spec) => `**/${spec}`)
    if (environment === 'test') specs = [...specs, ...excludeSpecs(skipInTest)]
    return specs
  }

  let baseSpecs
  if (
    environment !== 'local' &&
    runEnvironment === 'local' &&
    localTargetEnvironments.has(environment)
  ) {
    baseSpecs = [
      ...allSpecs,
      ...excludeSpecs(ingestSpecs),
      ...excludeSpecs(localAndNonLocalSharedSpecs)
    ]
  } else if (environment === 'local' && runEnvironment === 'local') {
    baseSpecs = [...allSpecs, ...excludeSpecs(ingestSpecs)]
  } else {
    baseSpecs = [...allSpecs, ...excludeSpecs(ingestSpecs)]
  }

  if (environment === 'test') {
    baseSpecs = [...baseSpecs, ...excludeSpecs(skipInTest)]
  }

  return baseSpecs
}
