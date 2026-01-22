import 'dotenv/config'

export const PARCELS_ENDPOINT = '/parcels'
export const PAYMENTS_ENDPOINT = '/payments/calculate'
export const PAYMENTS_ENDPOINT_V2 = '/api/v2/payments/calculate'
export const APPLICATION_VALIDATIONS_ENDPOINT = '/application/validate'
export const APPLICATION_VALIDATION_RUN_ENDPOINT = '/application/validation-run'
export const BEARER_TOKEN = process.env.BEARER_TOKEN
