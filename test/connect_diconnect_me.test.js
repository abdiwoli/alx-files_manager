import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('API Endpoints', () => {
  let validAuthHeader;

  // Create a user before running the tests
  before(async () => {
    // Create a new user
    const userData = { email: 'unique@example.com', password: 'securepassword123' };
    await request(app)
      .post('/users')
      .send(userData)
      .set('Content-Type', 'application/json');

    const authResponse = await request(app)
      .post('/connect')
      .set('Authorization', `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString('base64')}`);

    validAuthHeader = authResponse.body.token;
  });

  describe('GET /connect', () => {
    it('should return status 200 with a valid Authorization header', async () => {
      const res = await request(app)
        .get('/connect')
        .set('Authorization', `Basic ${Buffer.from('unique@example.com:securepassword123').toString('base64')}`);

      expect(res.status).to.equal(200);
    });

    it('should return status 401 with an invalid Authorization header', async () => {
      const res = await request(app)
        .get('/connect')
        .set('Authorization', `Basic ${Buffer.from('invalid@example.com:wrongpassword').toString('base64')}`);

      expect(res.status).to.equal(401);
      expect(res.body).to.deep.equal({ error: 'Unauthorized' });
    });
  });
});
