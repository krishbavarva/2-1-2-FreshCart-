import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getLikedProducts } from '../services/productService';

const LikedProductsContext = createContext();

export const useLikedProducts = () => {
  return useContext(LikedProductsContext);
};

export const LikedProductsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [likedProductsCount, setLikedProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadLikedProductsCount = useCallback(async () => {
    if (!currentUser) {
      setLikedProductsCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getLikedProducts();
      setLikedProductsCount(data.count || 0);
    } catch (error) {
      console.error('Error loading liked products count:', error);
      setLikedProductsCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadLikedProductsCount();
  }, [loadLikedProductsCount]);

  const refreshCount = () => {
    loadLikedProductsCount();
  };

  const value = {
    likedProductsCount,
    loading,
    refreshCount
  };

  return (
    <LikedProductsContext.Provider value={value}>
      {children}
    </LikedProductsContext.Provider>
  );
};
