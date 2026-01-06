import 'dotenv/config'

const devSpecs = ['**/*.spec.js']
const nonDevSpecs = ['**/*.spec.js', '!**/run-only-on-dev/*.spec.js']

export function getSpecsForEnv(env = process.env.ENVIRONMENT) {
  const normalized = (env || '').toLowerCase()
  return normalized === 'dev' ? devSpecs : nonDevSpecs
}
