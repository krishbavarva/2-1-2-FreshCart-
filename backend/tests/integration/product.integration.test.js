// Integration Tests for Product API
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';

describe('Product API Integration Tests', () => {
  let authToken;
  let testUserId;

  before(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-grocery');
    }
    
    // Create test user and get token
    const userData = {
      name: 'Product Test User',
      email: 'producttest@example.com',
      password: 'TestPassword123!',
      role: 'customer'
    };
    const registerRes = await request(app).post('/api/auth/register').send(userData);
    authToken = registerRes.body.token;
    testUserId = registerRes.body.user._id;

    // Clear products
    await Product.deleteMany({});
  });

  after(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/products', () => {
    before(async () => {
      // Create test products
      await Product.create([
        {
          name: 'Test Apple',
          brand: 'Test Brand',
          category: 'Fruits',
          price: 2.50,
          stock: 100,
          image: 'https://example.com/apple.jpg'
        },
        {
          name: 'Test Banana',
          brand: 'Test Brand',
          category: 'Fruits',
          price: 1.50,
          stock: 50,
          image: 'https://example.com/banana.jpg'
        }
      ]);
    });

    it('should get all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body).to.have.property('products');
      expect(res.body.products).to.be.an('array');
      expect(res.body.products.length).to.be.greaterThan(0);
    });

    it('should filter products by category', async () => {
      const res = await request(app)
        .get('/api/products?category=Fruits')
        .expect(200);

      expect(res.body.products).to.be.an('array');
      res.body.products.forEach(product => {
        expect(product.category).to.equal('Fruits');
      });
    });

    it('should search products by name', async () => {
      const res = await request(app)
        .get('/api/products?search=Apple')
        .expect(200);

      expect(res.body.products).to.be.an('array');
      expect(res.body.products.length).to.be.greaterThan(0);
      expect(res.body.products[0].name).to.include('Apple');
    });
  });

  describe('POST /api/products/:id/like', () => {
    let testProduct;

    before(async () => {
      testProduct = await Product.create({
        name: 'Like Test Product',
        brand: 'Test Brand',
        category: 'Test',
        price: 10.00,
        stock: 10,
        image: 'https://example.com/test.jpg'
      });
    });

    it('should like a product', async () => {
      const res = await request(app)
        .post(`/api/products/${testProduct._id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).to.have.property('message');
      expect(res.body.isLiked).to.be.true;
    });

    it('should unlike a product', async () => {
      const res = await request(app)
        .post(`/api/products/${testProduct._id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.isLiked).to.be.false;
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post(`/api/products/${testProduct._id}/like`)
        .expect(401);

      expect(res.body).to.have.property('error');
    });
  });
});



