const request = require('supertest');
const app = require('../app');

describe('API Regression Test Suite', () => {

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

  test('GET /employees/1 should return employee', async () => {
    const res = await request(app).get('/employees/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBeDefined();
  });

  test('POST /employees should create employee', async () => {
    const res = await request(app)
      .post('/employees')
      .send({ id: 10, name: 'Dayanand' });

    expect(res.statusCode).toBe(201);
  });

  test('GET invalid employee should return 404', async () => {
    const res = await request(app).get('/employees/999');
    expect(res.statusCode).toBe(404);
  });

});

