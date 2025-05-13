# Data-Driven Test Framework for Land Grants API

This repository hosts the acceptance tests for the Land Grants API, available at https://github.com/DEFRA/land-grants-api.

The tests are designed to run in the Dev and Test environments whenever a new version of the Land Grants API service is deployed.

Built on a CDP journey test suite, this repository has been enhanced to support data-driven tests by reading test data from a CSV file and executing them against the service's REST APIs.

## Local Development

Ensure you have Land-Grants-API service running locally.

## Run Tests and Generate Reports

```bash
# Install dependencies
npm install

# Run the tests
npm test

# Generate Allure report
npm run report

# View the report
npm run report:open
```

### Licence
THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3

The following attribution statement MUST be cited in your products and applications when using this information.

Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
