// Unit Tests for Utility Functions
import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('Price Formatting', () => {
    it('should format price with 2 decimal places', () => {
      const price = 10.5;
      const formatted = price.toFixed(2);
      
      expect(formatted).toBe('10.50');
    });

    it('should format price with currency symbol', () => {
      const price = 25.99;
      const formatted = `€${price.toFixed(2)}`;
      
      expect(formatted).toBe('€25.99');
    });
  });

  describe('String Utilities', () => {
    it('should capitalize first letter', () => {
      const str = 'hello';
      const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
      
      expect(capitalized).toBe('Hello');
    });

    it('should truncate long strings', () => {
      const longString = 'This is a very long string that needs to be truncated';
      const maxLength = 20;
      const truncated = longString.length > maxLength 
        ? longString.substring(0, maxLength) + '...'
        : longString;
      
      expect(truncated.length).toBeLessThanOrEqual(maxLength + 3);
    });
  });

  describe('Array Utilities', () => {
    it('should filter array by condition', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      const evens = numbers.filter(n => n % 2 === 0);
      
      expect(evens).toEqual([2, 4, 6]);
    });

    it('should map array to new values', () => {
      const numbers = [1, 2, 3];
      const doubled = numbers.map(n => n * 2);
      
      expect(doubled).toEqual([2, 4, 6]);
    });
  });
});

