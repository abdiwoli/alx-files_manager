import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

describe('API Endpoints', () => {
  describe('GET /status', () => {
    it('should return status 200 with both redis and db true', async () => {
      const res = await request(app).get('/status');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ redis: true, db: true });
    });
  });
});
