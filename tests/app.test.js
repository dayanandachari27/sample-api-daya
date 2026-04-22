const request = require('supertest');
const app = require('../app');

describe('Sample API Tests', () => {

  test('GET /health should return UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('GET /employees should return array', async () => {
    const res = await request(app).get('/employees');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  // test ('POST /employees should create employee', async () => {
  //   const res = await request(app)
  //     .post('/employees')
  //     .send({ id: 4, name: 'anu' });

  //   expect(res.statusCode).toBe(201);
  //   expect(res.body.name).toBe('anu');
  // });

});