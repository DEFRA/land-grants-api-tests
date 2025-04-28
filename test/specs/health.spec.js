import request from 'supertest'

describe('GET /health', () => {
  it('should return success', async () => {
    const res = await request(global.baseUrl)
      .get('/health')
      .set('Accept', 'application/json')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')

    expect(res.body).toEqual({ message: 'success' })
  })
})
