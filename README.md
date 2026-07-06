# Data-Driven Test Framework for Land Grants API

This repository hosts the acceptance tests for the Land Grants API, available at https://github.com/DEFRA/land-grants-api.

The tests are designed to run in the Dev and Test environments whenever a new version of the Land Grants API service is deployed.

Built on a CDP journey test suite, this repository has been enhanced to support data-driven tests by reading test data from a CSV file and executing them against the service's REST APIs.

## Run Tests

Install dependencies:

```bash
npm install
```

### Environment behavior

The test suite behavior is controlled by `ENVIRONMENT` and `RUN_ENV`.

1. `ENVIRONMENT=local` and `RUN_ENV=local`
Runs the standard local suite plus the 100-parcel validation/payment suite.

2. `ENVIRONMENT=dev|test|ext-test|perf-test` and `RUN_ENV=local`
Runs the standard shared-environment suite.

3. `ENVIRONMENT=dev|test|ext-test|perf-test` and `RUN_ENV` is not `local`
Runs the standard shared-environment suite and the 100-parcel validation/payment suites.

4. Ingest tests
Runs only on demand when targeting `dev|test|ext-test|perf-test` from a local machine.

### Commands by scenario

Run against local API:

```bash
npm run test:local
```

This generates and opens the Allure report automatically after test completion.

Run from local machine against shared envs:

```bash
RUN_ENV=local npm run test:dev
RUN_ENV=local npm run test:test
RUN_ENV=local npm run test:ext-test
RUN_ENV=local npm run test:perf-test
```

These commands generate and open the Allure report automatically after test completion.

Run ingest tests on demand from local machine:

```bash
npm run test:ingest:dev
npm run test:ingest:test
npm run test:ingest:ext-test
npm run test:ingest:perf-test
```

Run non-local (for example CI/CD):

```bash
npm run test:dev
npm run test:test
npm run test:ext-test
npm run test:perf-test
```

These commands also generate and open the Allure report automatically after test completion.

## Generate Reports

```bash
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
