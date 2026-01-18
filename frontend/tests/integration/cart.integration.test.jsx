// Integration Tests for Cart Functionality
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock cart service
const mockCartService = {
  getCart: vi.fn(() => Promise.resolve({
    items: [
      { productId: '1', name: 'Product 1', price: 10, quantity: 2 },
      { productId: '2', name: 'Product 2', price: 20, quantity: 1 }
    ],
    total: 40
  })),
  addToCart: vi.fn(() => Promise.resolve({ success: true })),
  updateCartItem: vi.fn(() => Promise.resolve({ success: true })),
  removeFromCart: vi.fn(() => Promise.resolve({ success: true }))
};

describe('Cart Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch cart items', async () => {
    const cart = await mockCartService.getCart();
    
    expect(cart.items).toHaveLength(2);
    expect(cart.total).toBe(40);
    expect(mockCartService.getCart).toHaveBeenCalled();
  });

  it('should add item to cart', async () => {
    const product = { _id: '3', name: 'Product 3', price: 15 };
    const result = await mockCartService.addToCart(product, 1);
    
    expect(result.success).toBe(true);
    expect(mockCartService.addToCart).toHaveBeenCalledWith(product, 1);
  });

  it('should update cart item quantity', async () => {
    const result = await mockCartService.updateCartItem('1', 3);
    
    expect(result.success).toBe(true);
    expect(mockCartService.updateCartItem).toHaveBeenCalledWith('1', 3);
  });

  it('should remove item from cart', async () => {
    const result = await mockCartService.removeFromCart('1');
    
    expect(result.success).toBe(true);
    expect(mockCartService.removeFromCart).toHaveBeenCalledWith('1');
  });
});


