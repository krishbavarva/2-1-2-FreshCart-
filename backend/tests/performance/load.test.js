// Performance Tests
import { describe, it } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import app from '../../app.js';

describe('Performance Tests', () => {
  describe('API Response Time', () => {
    it('should respond to GET /api/products within 1 second', async function() {
      this.timeout(2000);
      
      const startTime = Date.now();
      const res = await request(app).get('/api/products');
      const responseTime = Date.now() - startTime;
      
      expect(res.status).to.equal(200);
      expect(responseTime).to.be.lessThan(1000); // Less than 1 second
    });

    it('should handle multiple concurrent requests', async function() {
      this.timeout(5000);
      
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/api/products')
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      
      responses.forEach(res => {
        expect(res.status).to.equal(200);
      });
      
      // All 10 requests should complete in reasonable time
      expect(totalTime).to.be.lessThan(3000);
    });
  });

  describe('Database Query Performance', () => {
    it('should handle large result sets efficiently', async function() {
      this.timeout(5000);
      
      const startTime = Date.now();
      const res = await request(app)
        .get('/api/products')
        .query({ limit: 100 });
      const queryTime = Date.now() - startTime;
      
      expect(res.status).to.equal(200);
      expect(queryTime).to.be.lessThan(2000); // Should handle 100 products quickly
    });
  });
});


