import request from 'supertest'

describe('GET /parcel', () => {
  it('should return success', async () => {
    const res = await request(global.baseUrl)
      .get('/parcel/SX0679-9238')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

    expect(res.body.message).toEqual('success')
    expect(res.body.parcel.parcelId).toEqual('9238')
    expect(res.body.parcel.sheetId).toEqual('SX0679')
  })
})
