import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('API Endpoints', () => {
  describe('POST /users', () => {
    it('should create a new user and return the user data', async () => {
      const userData = {
        email: 'bob888@dylan.com',
        password: 'toto1234!'
      };

      const res = await request(app)
        .post('/users')
        .send(userData)
        .set('Content-Type', 'application/json');
      
      expect(res.status).to.equal(201);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('email').that.equals(userData.email);
      expect(res.body.id).to.be.a('string');
    });

    it('should return an error if email is missing', async () => {
      const userData = {
        password: 'toto1234!'
      };

      const res = await request(app)
        .post('/users')
        .send(userData)
        .set('Content-Type', 'application/json');
      
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('error').that.equals('Missing email');
    });

    it('should return an error if password is missing', async () => {
      const userData = {
        email: 'bob888@dylan.com'
      };

      const res = await request(app)
        .post('/users')
        .send(userData)
        .set('Content-Type', 'application/json');
      
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('error').that.equals('Missing password');
    });

    it('should return an error if email already exists', async () => {
      // First create a user
      await request(app)
        .post('/users')
        .send({
          email: 'existing@dylan.com',
          password: 'toto1234!'
        })
        .set('Content-Type', 'application/json');
      
      // Attempt to create another user with the same email
      const userData = {
        email: 'existing@dylan.com',
        password: 'newpassword!'
      };

      const res = await request(app)
        .post('/users')
        .send(userData)
        .set('Content-Type', 'application/json');
      
      expect(res.status).to.equal(400);
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('error').that.equals('Already exist');
    });
  });
});
