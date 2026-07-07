import 'dotenv/config'

export const PARCELS_ENDPOINT_V2 = '/api/v2/parcels'
export const PAYMENTS_ENDPOINT_V2 = '/api/v2/payments/calculate'
export const APPLICATION_VALIDATIONS_ENDPOINT_V2 =
  '/api/v2/application/validate'
export const APPLICATION_VALIDATION_RUN_ENDPOINT = '/application/validation-run'
export const WMP_VALIDATIONS_ENDPOINT = '/api/v1/wmp/validate'
export const WMP_PAYMENTS_ENDPOINT = '/api/v1/wmp/payments/calculate'

const environment = `${process.env.ENVIRONMENT || ''}`
  .trim()
  .toLowerCase()
  .replace(/-/g, '_')

const environmentBearerToken =
  process.env[`${environment}_BEARER_TOKEN`] ||
  process.env[`BEARER_TOKEN_${environment.toUpperCase()}`]

const environmentApiKey =
  process.env[`${environment}_API_KEY`] ||
  process.env[`API_KEY_${environment.toUpperCase()}`]

export const BEARER_TOKEN = environmentBearerToken || process.env.BEARER_TOKEN
export const API_KEY = environmentApiKey || process.env.API_KEY
