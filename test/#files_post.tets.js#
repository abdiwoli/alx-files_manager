import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('API Endpoints', () => {
  let token;

  // Create a user and get a token before running the tests
  before(async () => {
    // Create a new user
    const userData = { email: 'unique113@example.com', password: 'securepassword123' };
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

  describe('POST /files', () => {
    it('should create a file and return the file details', async () => {
      // Ensure token is available
      if (!token) {
        throw new Error('Auth token is undefined');
      }

      const fileData = {
        name: 'myText.txt',
        type: 'file',
        data: 'SGVsbG8gV2Vic3RhY2shCg=='
      };

      // Make the request to create the file
      const res = await request(app)
        .post('/files')
        .set('X-Token', token)  // Use the retrieved token here
        .set('Content-Type', 'application/json')
        .send(fileData);

      // Expected response structure
      const expectedFileDetails = {
        id: res.body.id,
        userId: res.body.userId,
        name: fileData.name,
        type: fileData.type,
        isPublic: false,
        parentId: 0
      };

      // Check if the response matches the expected file details
      expect(res.status).to.equal(201);
      expect(res.body).to.deep.equal(expectedFileDetails);
    });
  });
});
