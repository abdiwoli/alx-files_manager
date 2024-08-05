import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';
import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';

describe('API Endpoints', () => {
  describe('GET /stats', () => {
    it('should return status 200 with the correct structure', async () => {
      const res = await request(app).get('/stats');
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('users');
      expect(res.body).to.have.property('files');
      expect(res.body.users).to.be.a('number');
      expect(res.body.files).to.be.a('number');
    });
  });
});
