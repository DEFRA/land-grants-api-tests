import 'dotenv/config'

const localDevSpecs = ['**/*.spec.js']
const nonLocalDevSpecs = [
  '**/*.spec.js',
  '!**/run-only-on-dev-in-local/*.spec.js'
]

export function getSpecsForEnv(
  env = process.env.ENVIRONMENT,
  runEnv = process.env.RUN_ENV
) {
  const environment = (env || '').toLowerCase()
  const runEnvironment = (runEnv || '').toLowerCase()
  return environment === 'dev' && runEnvironment === 'local'
    ? localDevSpecs
    : nonLocalDevSpecs
}
