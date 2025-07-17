import request from 'supertest'
import { PARCELS_ENDPOINT } from '../utils/apiEndpoints.js'
// import { cleanupAllure } from '../utils/allureHelper.js'

// Add afterAll hook to clean up resources
// afterAll(async () => {
//   await cleanupAllure()
// })

describe('Parcels endpoint', () => {
  it('should validate parcels', async () => {
    // Post request body fields
    const parcelIds = ['SD7846-7013', 'SD5267-5941']
    const fields = ['size', 'actions']

    // Making the post request and validating the response status
    const res = await request(global.baseUrl)
      .post(PARCELS_ENDPOINT)
      .send({ parcelIds, fields })
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

    // Validate response message
    expect(res.body.message).toEqual('success')

    // Fetching the required parcels for validation
    const parcel1 = res.body.parcels.find(
      (parcel) => parcel.sheetId === 'SD7846' && parcel.parcelId === '7013'
    )

    if (!parcel1) {
      throw new Error(`Parcel Id SD7846-7013 is not available in the response`)
    }

    const parcel2 = res.body.parcels.find(
      (parcel) => parcel.sheetId === 'SD5267' && parcel.parcelId === '5941'
    )

    if (!parcel2) {
      throw new Error(`Parcel Id SD5267-5941 is not available in the response`)
    }

    // Validations on parcel1
    expect(parcel1.size.unit).toEqual('ha')
    expect(parcel1.size.value).toEqual(8.990178)
    parcel1.actions.forEach((action) => {
      if (action.code === 'CMOR1') {
        expect(action.description).toEqual(
          'CMOR1: Assess moorland and produce a written record'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(8.99052969)
      } else if (action.code === 'UPL1') {
        expect(action.description).toEqual(
          'UPL1: Moderate livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(8.99052969)
      } else if (action.code === 'UPL2') {
        expect(action.description).toEqual(
          'UPL2: Low livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(8.99052969)
      } else if (action.code === 'UPL3') {
        expect(action.description).toEqual(
          'UPL3: Limited livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(8.99052969)
      }
    })

    // Validations on parcel2
    expect(parcel2.size.unit).toEqual('ha')
    expect(parcel2.size.value).toEqual(5.118538)
    parcel2.actions.forEach((action) => {
      if (action.code === 'CMOR1') {
        expect(action.description).toEqual(
          'CMOR1: Assess moorland and produce a written record'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(3.44324524)
      } else if (action.code === 'UPL1') {
        expect(action.description).toEqual(
          'UPL1: Moderate livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(3.44324524)
      } else if (action.code === 'UPL2') {
        expect(action.description).toEqual(
          'UPL2: Low livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(3.44324524)
      } else if (action.code === 'UPL3') {
        expect(action.description).toEqual(
          'UPL3: Limited livestock grazing on moorland'
        )
        expect(action.availableArea.unit).toEqual('ha')
        expect(action.availableArea.value).toEqual(3.44324524)
      }
    })
  })
})
