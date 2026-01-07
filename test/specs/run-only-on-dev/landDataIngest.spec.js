import { transferResource } from '../../utils/ingestLandDataHelper.js'
import { createLandParcels } from '../../utils/createLandParcels.js'
import { createLandCovers } from '../../utils/createLandCovers.js'
import request from 'supertest'
import { PARCELS_ENDPOINT, BEARER_TOKEN } from '../../utils/apiEndpoints.js'

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/* This test case runs only on the 'dev' environment
It performs the following steps:
- Creates a new land parcel csv file with one new unique fake land parcel and one existing land parcel
- Creates a new land cover csv file with land covers for above fake land parcel and land covers for one existing land parcel
- Upload these files to s3 bucket
- Ingest the land_parcels and land_covers files
- Calls parcels api for both land parcels and do assertions for size, available area etc., to validate parcel loaded successfully and no duplicate land covers loaded
*/

// Get current date and time
const now = new Date()
const dd = String(now.getDate()).padStart(2, '0')
const mm = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-based
const yy = String(now.getFullYear()).slice(-2)
const SHEET_ID1 = dd + mm + yy
const PARCEL_ID1 =
  String(now.getHours()).padStart(2, '0') +
  String(now.getMinutes()).padStart(2, '0')
const SHEET_ID2 = 'SK0971'
const PARCEL_ID2 = '5268'

describe('Land data ingest', () => {
  it('should validate land parcels and land covers ingested', async () => {
    // create land parcels and land covers files with unique SHEET_ID and PARCEL_ID
    await createLandParcels(SHEET_ID1, PARCEL_ID1, SHEET_ID2, PARCEL_ID2)
    await createLandCovers(SHEET_ID1, PARCEL_ID1, SHEET_ID2, PARCEL_ID2)

    // transfer a land parcels file and ingest to the dev environment
    const parcelsFile = 'test/land-data/parcels/parcels_test.csv'
    await transferResource(parcelsFile, 'land_parcels', 'dev')

    // transfer a land covers file and ingest to the dev environment
    const coversFile = 'test/land-data/covers/covers_test.csv'
    await transferResource(coversFile, 'land_covers', 'dev')

    const parcelIds = [
      `${SHEET_ID1}-${PARCEL_ID1}`,
      `${SHEET_ID2}-${PARCEL_ID2}`
    ]
    const fields = ['size', 'actions']

    await pause(30000)

    // Making the post request and validating the response status
    const res = await request(global.baseUrl)
      .post(PARCELS_ENDPOINT)
      .send({ parcelIds, fields })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${BEARER_TOKEN}`)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

    // Validate response message
    expect(res.body.message).toEqual('success')

    // Fetching the required parcels for validation
    const parcel1 = res.body.parcels.find(
      (parcel) => parcel.sheetId === SHEET_ID1 && parcel.parcelId === PARCEL_ID1
    )

    if (!parcel1) {
      throw new Error(
        `Parcel Id ${SHEET_ID1}-${PARCEL_ID1} is not available in the response`
      )
    }

    const parcel2 = res.body.parcels.find(
      (parcel) => parcel.sheetId === SHEET_ID2 && parcel.parcelId === PARCEL_ID2
    )

    if (!parcel2) {
      throw new Error(
        `Parcel Id ${SHEET_ID2}-${PARCEL_ID2} is not available in the response`
      )
    }

    // Validations on parcel1
    expect(parcel1.size.unit).toEqual('ha')
    expect(parcel1.size.value).toEqual(7.5012)
    parcel1.actions.forEach((action) => {
      if (action.code === 'CMOR1') {
        expect(action.description).toEqual(
          'Assess moorland and produce a written record'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(7.0197)
      } else if (action.code === 'UPL1') {
        expect(action.description).toEqual(
          'Moderate livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(7.0197)
      } else if (action.code === 'UPL2') {
        expect(action.description).toEqual('Low livestock grazing on moorland')
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(7.0197)
      } else if (action.code === 'UPL3') {
        expect(action.description).toEqual(
          'Limited livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(7.0197)
      }
    })

    // Validations on parcel2
    expect(parcel2.size.unit).toEqual('ha')
    expect(parcel2.size.value).toEqual(0.1259)
    parcel2.actions.forEach((action) => {
      if (action.code === 'CMOR1') {
        expect(action.description).toEqual(
          'Assess moorland and produce a written record'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(0.1259)
      } else if (action.code === 'UPL1') {
        expect(action.description).toEqual(
          'Moderate livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(0.1259)
      } else if (action.code === 'UPL2') {
        expect(action.description).toEqual('Low livestock grazing on moorland')
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(0.1259)
      } else if (action.code === 'UPL3') {
        expect(action.description).toEqual(
          'Limited livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(0.1259)
      }
    })
  })
})
