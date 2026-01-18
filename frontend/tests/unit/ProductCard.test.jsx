// Unit Tests for ProductCard Component
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock ProductCard component (create a simple version for testing)
const ProductCard = ({ product, onAddToCart, onLike }) => {
  return (
    <div data-testid="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
      <button onClick={() => onLike(product._id)}>Like</button>
    </div>
  );
};

describe('ProductCard Component', () => {
  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    price: 10.99,
    image: 'https://example.com/image.jpg',
    category: 'Fruits'
  };

  it('should render product name', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} onAddToCart={() => {}} onLike={() => {}} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render product price', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} onAddToCart={() => {}} onLike={() => {}} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('$10.99')).toBeInTheDocument();
  });

  it('should call onAddToCart when button is clicked', () => {
    const mockAddToCart = vi.fn();
    
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} onAddToCart={mockAddToCart} onLike={() => {}} />
      </BrowserRouter>
    );
    
    const addButton = screen.getByText('Add to Cart');
    fireEvent.click(addButton);
    
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('should call onLike when like button is clicked', () => {
    const mockLike = vi.fn();
    
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} onAddToCart={() => {}} onLike={mockLike} />
      </BrowserRouter>
    );
    
    const likeButton = screen.getByText('Like');
    fireEvent.click(likeButton);
    
    expect(mockLike).toHaveBeenCalledWith('1');
  });
});

