// Integration Tests for Authentication API
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import User from '../../models/User.js';

describe('Authentication API Integration Tests', () => {
  before(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-grocery');
    }
    // Clear users collection
    await User.deleteMany({});
  });

  after(async () => {
    // Clean up
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        role: 'customer'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('email', userData.email);
      expect(res.body.user).to.not.have.property('password');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'Test User 2',
        email: 'test@example.com', // Same email
        password: 'TestPassword123!',
        role: 'customer'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body).to.have.property('error');
    });

    it('should reject invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'TestPassword123!',
        role: 'customer'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body).to.have.property('error');
    });
  });

  describe('POST /api/auth/login', () => {
    before(async () => {
      // Create a test user
      const userData = {
        name: 'Login Test User',
        email: 'logintest@example.com',
        password: 'TestPassword123!',
        role: 'customer'
      };
      await request(app).post('/api/auth/register').send(userData);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'logintest@example.com',
        password: 'TestPassword123!'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('email', loginData.email);
    });

    it('should reject invalid password', async () => {
      const loginData = {
        email: 'logintest@example.com',
        password: 'WrongPassword'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body).to.have.property('error');
    });

    it('should reject non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body).to.have.property('error');
    });
  });
});

