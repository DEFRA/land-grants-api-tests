global.baseUrl = process.env.ENVIRONMENT ?
  `https://land-grants-api.${process.env.ENVIRONMENT}.cdp-int.defra.cloud` :  'http://localhost:3001';
