import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('API Endpoints', () => {
  let token;

  // Create a user and get a token before running the tests
  before(async () => {
    // Create a new user
    const userData = { email: 'unique114@example.com', password: 'securepassword423' };
    await request(app)
      .post('/users')
      .send(userData)
      .set('Content-Type', 'application/json');

    // Get token
    const res = await request(app)
      .get('/connect')
      .set('Authorization', `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString('base64')}`);

    token = res.body.token;
    
    // Print the token to verify
    console.log('Retrieved Token:', token);
  });

  describe('GET /files', () => {
    it('should return a list of files with valid keys', async () => {
      if (!token) {
        throw new Error('Auth token is undefined');
      }

      // Make the request to get the list of files
      const res = await request(app)
        .get('/files')
        .set('X-Token', token);  // Use the retrieved token here

      // Check if response is an array
      expect(res.status).to.equal(200); 
      expect(res.body).to.be.an('array');

      // Verify each item in the array has the required keys
      res.body.forEach(file => {
        expect(file).to.be.an('object');
        expect(file).to.have.all.keys('id', 'userId', 'name', 'type', 'isPublic', 'parentId');
        expect(file.id).to.be.a('string');
        expect(file.userId).to.be.a('string');
        expect(file.name).to.be.a('string');
        expect(file.type).to.be.a('string');
        expect(file.isPublic).to.be.a('boolean');
        expect(file.parentId).to.be.oneOf(0); 
      });
    });
  });
});
