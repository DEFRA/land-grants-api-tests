import 'dotenv/config'

export const PARCELS_ENDPOINT = '/parcels'
export const PARCELS_ENDPOINT_V2 = '/api/v2/parcels'
export const PAYMENTS_ENDPOINT = '/payments/calculate'
export const PAYMENTS_ENDPOINT_V2 = '/api/v2/payments/calculate'
export const APPLICATION_VALIDATIONS_ENDPOINT = '/application/validate'
export const APPLICATION_VALIDATIONS_ENDPOINT_V2 =
  '/api/v2/application/validate'
export const APPLICATION_VALIDATION_RUN_ENDPOINT = '/application/validation-run'
export const BEARER_TOKEN = process.env.BEARER_TOKEN
export const WMP_VALIDATIONS_ENDPOINT = '/api/v1/wmp/validate'
export const WMP_PAYMENTS_ENDPOINT = '/api/v1/wmp/payments/calculate'
