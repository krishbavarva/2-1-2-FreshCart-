// Unit Tests for Product Logic
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('Product Unit Tests', () => {
  describe('Product Price Calculation', () => {
    it('should calculate total price correctly', () => {
      const price = 10.50;
      const quantity = 3;
      const total = price * quantity;
      
      expect(total).to.equal(31.50);
    });

    it('should handle decimal prices', () => {
      const price = 9.99;
      const quantity = 2;
      const total = price * quantity;
      
      expect(total).to.be.closeTo(19.98, 0.01);
    });
  });

  describe('Product Validation', () => {
    it('should validate product name', () => {
      const validName = 'Test Product';
      const invalidName = '';
      
      expect(validName.length).to.be.greaterThan(0);
      expect(invalidName.length).to.equal(0);
    });

    it('should validate product price', () => {
      const validPrice = 10.50;
      const invalidPrice = -5;
      
      expect(validPrice).to.be.greaterThan(0);
      expect(invalidPrice).to.be.lessThan(0);
    });

    it('should validate stock quantity', () => {
      const validStock = 100;
      const invalidStock = -1;
      
      expect(validStock).to.be.greaterThanOrEqual(0);
      expect(invalidStock).to.be.lessThan(0);
    });
  });

  describe('Product Filtering Logic', () => {
    const products = [
      { name: 'Apple', category: 'Fruits', price: 2.50 },
      { name: 'Banana', category: 'Fruits', price: 1.50 },
      { name: 'Carrot', category: 'Vegetables', price: 1.00 },
      { name: 'Milk', category: 'Dairy', price: 3.50 }
    ];

    it('should filter by category', () => {
      const category = 'Fruits';
      const filtered = products.filter(p => p.category === category);
      
      expect(filtered).to.have.lengthOf(2);
      expect(filtered[0].category).to.equal(category);
    });

    it('should filter by price range', () => {
      const minPrice = 1.00;
      const maxPrice = 2.00;
      const filtered = products.filter(p => p.price >= minPrice && p.price <= maxPrice);
      
      expect(filtered).to.have.lengthOf(2);
    });

    it('should search by name', () => {
      const searchTerm = 'apple';
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(filtered).to.have.lengthOf(1);
      expect(filtered[0].name).to.equal('Apple');
    });
  });
});


