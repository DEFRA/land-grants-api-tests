# Data-Driven Test Framework for Land Grants API

This repository contains the acceptance tests for the Land Grants API located at https://github.com/DEFRA/land-grants-api.

These tests will run against the Dev / Test environments, when a new version of the Land Grant API service is deployed in those environments.

The repository is based on a CDP journey test suite, amended to run Jest tests against the REST APIs of the service.


## How to Use

### 1. Create a CSV Data File

Create a CSV file in the `data/` directory with your test cases:

```csv
sheetId,parcelId,expectedStatusCode,expectedMessage,expectedSizeUnit,expectedSizeValue,expectedActionCode
SX0679,9238,200,success,ha,440,CMOR1
AB1234,9999,404,Land parcel not found,,,
```

### 2. Create a Test Spec

Create a test spec file in the `specs/` directory:

```javascript
import request from 'supertest'
import { readCsv } from '../utils/csvReader'
import { runAllTests, validateResponse } from '../utils/testHelper'

describe('Your API Test', () => {
  let testData = []

  beforeAll(async () => {
    testData = await readCsv('./test/data/yourData.csv')
  })

  it('should validate all test cases', async () => {
    const testFunction = async (testCase) => {
      const response = await request(global.baseUrl)
        .get(`/your-endpoint/${testCase.someId}`)
        .set('Accept', 'application/json')

      // Define custom validators if needed
      const customValidator = (response, testCase) => {
        // Your custom validation logic
      }

      validateResponse(response, testCase, {
        allureReport: true,
        customValidators: [customValidator]
      })
    }

    const results = await runAllTests(testData, testFunction, {
      allureReport: true
    })

    if (results.failed > 0) {
      throw new Error(`${results.failed} out of ${results.total} tests failed`)
    }
  })
})
```

### 3. Run Tests and Generate Reports

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
