// Unit Tests for Authentication
import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication Unit Tests', () => {
  describe('Password Hashing', () => {
    it('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).to.not.equal(password);
      expect(hashedPassword).to.be.a('string');
      expect(hashedPassword.length).to.be.greaterThan(50);
    });

    it('should verify password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(password, hashedPassword);
      
      expect(isValid).to.be.true;
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      
      expect(isValid).to.be.false;
    });
  });

  describe('JWT Token Generation', () => {
    const secret = 'test-secret-key';
    const payload = { userId: '123', email: 'test@example.com' };

    it('should generate JWT token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      expect(token).to.be.a('string');
      expect(token.split('.')).to.have.lengthOf(3); // JWT has 3 parts
    });

    it('should verify JWT token', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret);
      
      expect(decoded.userId).to.equal(payload.userId);
      expect(decoded.email).to.equal(payload.email);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        jwt.verify(invalidToken, secret);
      }).to.throw();
    });
  });
});


