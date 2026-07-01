import 'dotenv/config'

const localDevSpecs = ['**/*.spec.js']
const nonLocalDevSpecs = ['**/*.spec.js', '!**/run-only-from-local/*.spec.js']

export function getSpecsForEnv(
  env = process.env.ENVIRONMENT,
  runEnv = process.env.RUN_ENV
) {
  const environment = (env || '').toLowerCase()
  const runEnvironment = (runEnv || '').toLowerCase()
  return environment !== 'local' && runEnvironment === 'local'
    ? localDevSpecs
    : nonLocalDevSpecs
}
