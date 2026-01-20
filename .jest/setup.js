if (process.env.ENVIRONMENT === 'local') {
  global.baseUrl = 'http://localhost:3009';
} else if (process.env.ENVIRONMENT !== 'local' && process.env.RUN_ENV !== 'local') {
  global.baseUrl = `https://land-grants-api.${process.env.ENVIRONMENT}.cdp-int.defra.cloud`;
} else if (process.env.ENVIRONMENT !== 'local' && process.env.RUN_ENV === 'local') {
  global.baseUrl = `https://ephemeral-protected.api.${process.env.ENVIRONMENT}.cdp-int.defra.cloud/land-grants-api`;
}