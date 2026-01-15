import React, { useState, useEffect, useRef } from 'react';
import { getProducts, searchProducts, getCategories, toggleLike } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import NutriScoreBadge from '../components/common/NutriScoreBadge';
import toast from 'react-hot-toast';

const Products = () => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [likedProducts, setLikedProducts] = useState(new Set());
  
  // New filter states
  const [proteinFilter, setProteinFilter] = useState('');
  const [nutriscoreFilter, setNutriscoreFilter] = useState('all');
  const [bestSellerFilter, setBestSellerFilter] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, best-seller, high-protein, nutritious

  const searchInputRef = useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory, proteinFilter, nutriscoreFilter, bestSellerFilter, filterType]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {
        proteinMin: proteinFilter || undefined,
        nutriscoreGrade: nutriscoreFilter !== 'all' ? nutriscoreFilter : undefined,
        bestSeller: bestSellerFilter || undefined,
        filter: filterType !== 'all' ? filterType : undefined
      };
      const data = await getProducts('', page, selectedCategory, filters);
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to load products');
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadProducts();
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const data = await searchProducts(searchTerm);
      setProducts(data.products || []);
      setShowSuggestions(false);
      toast.success(`Found ${data.products?.length || 0} products`);
    } catch (error) {
      toast.error('Search failed');
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length > 0) {
      try {
        const data = await searchProducts(value);
        const productNames = data.products?.slice(0, 5).map(p => p.name) || [];
        const uniqueSuggestions = [...new Set(productNames)];
        setSuggestions(uniqueSuggestions);
        setShowSuggestions(uniqueSuggestions.length > 0);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      const form = searchInputRef.current?.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setPage(1);
  };

  const handleLike = async (productId, e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.error('Please login to like products');
      return;
    }

    try {
      const result = await toggleLike(productId);
      setLikedProducts(prev => {
        const newSet = new Set(prev);
        if (result.isLiked) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
      
      // Update product in list
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, likesCount: result.likesCount, isLiked: result.isLiked }
          : p
      ));
      
      toast.success(result.isLiked ? 'Product liked!' : 'Product unliked');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like product');
    }
  };

  const handleAddToCart = async (product) => {
    // Check stock before adding
    if (product.stock === 0 || product.status === 'out_of_stock') {
      toast.error('This product is out of stock');
      return;
    }

    if (product.stock < 1) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    try {
      await addToCart(product);
    } catch (error) {
      // Error is already handled in CartContext
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Cannot add to cart');
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setProteinFilter('');
    setNutriscoreFilter('all');
    setBestSellerFilter(false);
    setFilterType('all');
    setPage(1);
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

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading products...</p>
          <p className="mt-2 text-gray-500 text-sm">Fetching from Open Food Facts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Discover fresh groceries from around the world</p>
        </div>

        {/* Filters and Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Category Filter */}
            <div className="relative">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                disabled={loadingCategories}
                className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium cursor-pointer transition-all hover:border-blue-400"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="relative" ref={searchInputRef}>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Products (Name, Brand, Barcode)
              </label>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchInputChange}
                      onFocus={() => {
                        if (suggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Search by name, brand, barcode..."
                      className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-400"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg transition-all font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Suggestions</div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-50 transition-all flex items-center gap-2 group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="group-hover:font-semibold">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Products</option>
                <option value="best-seller">Best Sellers</option>
                <option value="high-protein">High Protein</option>
                <option value="nutritious">Nutritious (A/B Grade)</option>
              </select>
            </div>

            {/* Protein Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Protein (g/100g)</label>
              <input
                type="number"
                value={proteinFilter}
                onChange={(e) => {
                  setProteinFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. 10"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Nutri-Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nutri-Score</label>
              <select
                value={nutriscoreFilter}
                onChange={(e) => {
                  setNutriscoreFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Grades</option>
                <option value="A">A (Best)</option>
                <option value="B">B (Good)</option>
                <option value="C">C (Moderate)</option>
                <option value="D">D (Poor)</option>
                <option value="E">E (Worst)</option>
              </select>
            </div>

            {/* Best Seller Toggle */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bestSellerFilter}
                  onChange={(e) => {
                    setBestSellerFilter(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Best Sellers Only</span>
              </label>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedCategory !== 'all' || proteinFilter || nutriscoreFilter !== 'all' || bestSellerFilter || filterType !== 'all') && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all font-medium shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {products.length === 0 && !loading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              const isLiked = likedProducts.has(product.id) || product.isLiked;
              
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
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <svg 
                          className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                          fill={isLiked ? 'currentColor' : 'none'} 
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

                    {/* Barcode */}
                    {product.barcode && (
                      <p className="text-xs text-gray-500 mb-2">
                        <span className="font-medium">Barcode:</span> {product.barcode}
                      </p>
                    )}

                    {/* Protein Info */}
                    {product.protein && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Protein:</span> {product.protein}g per 100g
                      </p>
                    )}

                    {/* Nutritional Info */}
                    {product.nutritionalValue && (
                      <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Nutrition (per 100g)</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {product.nutritionalValue.energy && (
                            <div>
                              <span className="text-gray-600">Energy:</span>
                              <span className="font-semibold ml-1 text-gray-900">{product.nutritionalValue.energy} kcal</span>
                            </div>
                          )}
                          {product.nutritionalValue.fat && (
                            <div>
                              <span className="text-gray-600">Fat:</span>
                              <span className="font-semibold ml-1 text-gray-900">{product.nutritionalValue.fat}g</span>
                            </div>
                          )}
                          {product.nutritionalValue.carbs && (
                            <div>
                              <span className="text-gray-600">Carbs:</span>
                              <span className="font-semibold ml-1 text-gray-900">{product.nutritionalValue.carbs}g</span>
                            </div>
                          )}
                          {product.protein && (
                            <div>
                              <span className="text-gray-600">Protein:</span>
                              <span className="font-semibold ml-1 text-gray-900">{product.protein}g</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Likes Count */}
                    {product.likesCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{product.likesCount} likes</span>
                      </div>
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
        )}

        {/* Results Count */}
        {products.length > 0 && (
          <div className="mb-4 text-sm text-gray-600 mt-6">
            Showing <span className="font-semibold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && (
              <span> in <span className="font-semibold text-blue-600">{selectedCategory}</span></span>
            )}
          </div>
        )}

        {/* Pagination */}
        {!searchTerm && products.length > 0 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 text-gray-700 font-medium">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={products.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors font-medium"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
