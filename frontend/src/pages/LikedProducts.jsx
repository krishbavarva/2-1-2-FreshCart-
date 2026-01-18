import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLikedProducts, toggleLike } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLikedProducts } from '../contexts/LikedProductsContext';
import NutriScoreBadge from '../components/common/NutriScoreBadge';
import toast from 'react-hot-toast';

const LikedProducts = () => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { refreshCount } = useLikedProducts();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedProducts();
  }, []);

  const loadLikedProducts = async () => {
    try {
      setLoading(true);
      const data = await getLikedProducts();
      console.log('📦 Liked products response:', data);
      
      // Handle different response formats
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.warn('Unexpected response format:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error loading liked products:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Better error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load liked products. Please try again.';
      
      toast.error(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (productId, e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please login to like products');
      return;
    }

    try {
      const result = await toggleLike(productId);
      
      // Remove from list if unliked
      if (!result.isLiked) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        refreshCount(); // Update count in navbar
        toast.success('Product removed from favorites');
      } else {
        toast.success('Product liked!');
        refreshCount(); // Update count in navbar
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update product');
    }
  };

  const handleAddToCart = async (product) => {
    if (!currentUser) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (product.stock === 0 || product.status === 'out_of_stock') {
      toast.error('This product is out of stock');
      return;
    }

    if (product.stock < 1) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    try {
      console.log('🛒 Adding product to cart:', product.id, product.name);
      await addToCart(product);
      // Success message is shown in CartContext
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to add product to cart';
      
      toast.error(errorMessage);
    }
  };

  const getStockStatus = (product) => {
    if (product.stock === 0 || product.status === 'out_of_stock') {
      return { text: 'Out of Stock', color: 'bg-red-500', textColor: 'text-white' };
    }
    if (product.stock > 0 && product.stock < 30) {
      return { text: 'Low Stock', color: 'bg-yellow-500', textColor: 'text-white' };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading liked products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Liked Products</h1>
          <p className="text-gray-600">Products you've saved as favorites</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No liked products yet</h3>
            <p className="text-gray-600 mb-6">Start exploring products and like the ones you're interested in!</p>
            <Link
              to="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing <span className="font-semibold">{products.length}</span> liked product{products.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group relative"
                  >
                    {/* Stock Status Badge Overlay */}
                    {stockStatus && (
                      <div className={`absolute top-0 left-0 right-0 ${stockStatus.color} ${stockStatus.textColor} text-center py-2 text-sm font-semibold z-10`}>
                        {stockStatus.text}
                      </div>
                    )}

                    {/* Best Seller Badge */}
                    {product.isBestSeller && (
                      <div className="absolute top-0 right-0 bg-yellow-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg z-10">
                        ⭐ Best Seller
                      </div>
                    )}

                    {/* Product Image */}
                    <div className={`relative h-64 flex items-center justify-center overflow-hidden bg-gray-50 ${stockStatus ? 'mt-10' : ''}`}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                            e.target.className = 'w-full h-full object-cover';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400 text-sm font-medium">No Image</span>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {product.category && product.category !== 'Uncategorized' && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm border border-gray-200">
                            {product.category}
                          </span>
                        </div>
                      )}
                      
                      {/* Nutri-Score Badge */}
                      {product.nutriscoreGrade && (
                        <div className="absolute top-3 right-3">
                          <NutriScoreBadge grade={product.nutriscoreGrade} size="md" />
                        </div>
                      )}

                      {/* Like Button */}
                      {currentUser && (
                        <button
                          onClick={(e) => handleLike(product.id, e)}
                          className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
                          title="Remove from favorites"
                        >
                          <svg 
                            className="w-5 h-5 text-red-500 fill-current" 
                            fill="currentColor" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5 flex flex-col flex-grow">
                      {/* Brand */}
                      {product.brand && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {product.brand}
                        </p>
                      )}
                      
                      {/* Product Name */}
                      <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2 min-h-[3.5rem]">
                        {product.name}
                      </h3>

                      {/* Protein Info */}
                      {product.protein && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Protein:</span> {product.protein}g per 100g
                        </p>
                      )}

                      {/* Stock Info */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Stock:</span> {product.stock || 0} {product.unit || 'piece'}
                        </p>
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-3xl font-extrabold text-gray-900">
                              ${product.price?.toFixed(2) || '0.00'}
                            </p>
                            {(!product.price || product.price === 0) && (
                              <p className="text-xs text-gray-500 mt-1">Check store for price</p>
                            )}
                          </div>
                        </div>
                        <button
                          className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${
                            product.stock === 0 || product.status === 'out_of_stock'
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0 || product.status === 'out_of_stock'}
                          title={product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                        >
                          {product.stock === 0 ? (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Out of Stock</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LikedProducts;
