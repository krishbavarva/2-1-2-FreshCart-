import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cartService';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemCount, setItemCount] = useState(0);
  const loadingRef = useRef(false);
  const autoSaveTimeoutRef = useRef(null);
  const pendingUpdatesRef = useRef(new Map());

  const loadCart = useCallback(async () => {
    if (!currentUser) {
      setCart(null);
      setItemCount(0);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      const data = await cartService.getCart();
      setCart(data.cart);
      setItemCount(data.itemCount || 0);
    } catch (error) {
      console.error('Error loading cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load cart';
      const statusCode = error.response?.status;
      const errorDetails = error.response?.data;
      
      // Log full 500 error details for debugging
      if (statusCode === 500) {
        console.error('❌ 500 INTERNAL SERVER ERROR - GET CART:');
        console.error('Error Message:', errorDetails?.error || errorMessage);
        console.error('Error Name:', errorDetails?.errorName);
        console.error('Error Code:', errorDetails?.errorCode);
        console.error('Full Error Response:', JSON.stringify(errorDetails, null, 2));
        if (errorDetails?.stack) {
          console.error('Stack Trace:', errorDetails.stack);
        }
        toast.error(`Server Error: ${errorDetails?.error || errorMessage}`, {
          duration: 6000,
          style: {
            background: '#ef4444',
            color: '#fff',
          }
        });
      } else if (statusCode === 404) {
        console.error('Cart route not found. Make sure backend server is restarted with new routes.');
        toast.error('Cart service unavailable. Please restart backend server.');
      } else if (statusCode === 401) {
        toast.error('Please login to view cart');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentUser]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (product) => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const data = await cartService.addToCart({
        productId: product.id,
        name: product.name,
        brand: product.brand || '',
        price: product.price || 0,
        image: product.image || '',
        quantity: 1,
        category: product.category || ''
      });
      setCart(data.cart);
      setItemCount(data.itemCount || 0);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      const statusCode = error.response?.status;
      const errorDetails = error.response?.data;
      
      // Log full 500 error details for debugging
      if (statusCode === 500) {
        console.error('❌ 500 INTERNAL SERVER ERROR - ADD TO CART:');
        console.error('Error Message:', errorDetails?.error || error.message);
        console.error('Error Name:', errorDetails?.errorName);
        console.error('Error Code:', errorDetails?.errorCode);
        console.error('Full Error Response:', JSON.stringify(errorDetails, null, 2));
        if (errorDetails?.stack) {
          console.error('Stack Trace:', errorDetails.stack);
        }
        toast.error(`Server Error: ${errorDetails?.error || error.message}`, {
          duration: 6000,
          style: {
            background: '#ef4444',
            color: '#fff',
          }
        });
      } else if (statusCode === 404) {
        toast.error('Cart service not available. Please restart backend server.');
      } else if (statusCode === 401) {
        toast.error('Please login to add items to cart');
      } else if (statusCode === 503) {
        toast.error('Database connection error. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add item to cart');
      }
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!currentUser) {
      toast.error('Please login to update cart');
      return;
    }

    try {
      console.log('🛒 Updating quantity:', { itemId, quantity, itemIdType: typeof itemId });
      
      // Clean itemId - ensure it's a valid string
      const cleanItemId = String(itemId || '').trim();
      
      if (!cleanItemId) {
        toast.error('Invalid item ID');
        return;
      }
      
      const data = await cartService.updateCartItem(cleanItemId, quantity);
      setCart(data.cart);
      setItemCount(data.itemCount || 0);
    } catch (error) {
      console.error('❌ Error updating cart:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to update cart';
      toast.error(errorMessage);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const data = await cartService.removeFromCart(itemId);
      setCart(data.cart);
      setItemCount(data.itemCount || 0);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
      setItemCount(0);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    cart,
    itemCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

