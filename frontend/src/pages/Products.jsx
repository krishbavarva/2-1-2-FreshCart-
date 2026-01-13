import React, { useState, useEffect, useRef } from 'react';
import { getProducts, searchProducts, getCategories } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCategory]);

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
      const data = await getProducts('', page, selectedCategory);
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
        // Get suggestions based on current input
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
    // Trigger search
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
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
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
    setPage(1); // Reset to first page when category changes
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading products...</p>
          <p className="mt-2 text-gray-500 text-sm">Fetching from Open Food Facts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      background: 'linear-gradient(135deg, #1a5f3f 0%, #2d7a52 25%, #1e6b47 50%, #2d7a52 75%, #1a5f3f 100%)'
    }}>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Our Products</h1>
          <p className="text-white/80">Discover fresh groceries from around the world</p>
        </div>

        {/* Filters and Search Section */}
        <div className="relative rounded-2xl shadow-xl p-6 mb-8 border-2 backdrop-blur-sm overflow-visible" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(249, 115, 22, 0.3)',
          zIndex: 10000,
          position: 'relative'
        }}>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ position: 'relative', zIndex: 10 }}>
            {/* Category Filter */}
            <div className="relative z-30" ref={categoryDropdownRef} style={{ position: 'relative', zIndex: 30 }}>
              <label htmlFor="category" className="block text-sm font-bold text-white mb-2">
                Filter by Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  disabled={loadingCategories}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 font-medium cursor-pointer transition-all hover:border-green-400"
                  style={{ 
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {loadingCategories && (
                <span className="text-xs text-gray-500 mt-1 block">Loading categories...</span>
              )}
              
            </div>

            {/* Search Bar with Suggestions */}
            <div className="relative" ref={searchInputRef} style={{ position: 'relative', zIndex: 10000 }}>
              <label htmlFor="search" className="block text-sm font-bold text-white mb-2">
                Search Products
              </label>
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      id="search"
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchInputChange}
                      onFocus={() => {
                        if (suggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Search by name, brand..."
                      className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-green-400"
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
                    className="text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {(searchTerm || selectedCategory !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setPage(1);
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all font-medium shadow-md"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-60 overflow-y-auto" style={{ position: 'absolute', zIndex: 9999 }}>
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Suggestions</div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all flex items-center gap-2 group"
                        >
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>

      {/* Products Grid */}
      {products.length === 0 && !loading ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
          <p className="text-white/70 mb-6">Try adjusting your search or filter criteria</p>
          {(searchTerm || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPage(1);
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative" style={{ zIndex: 1 }}>
          {products.map((product) => {
            // Extract primary category
            const primaryCategory = product.category 
              ? product.category.split(',')[0].trim() 
              : 'Uncategorized';
            
            // Format price
            const formattedPrice = product.price && product.price > 0 
              ? `$${product.price.toFixed(2)}` 
              : 'Price not available';
            
            return (
              <div
                key={product.id}
                className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group transform hover:-translate-y-2 border-2"
                style={{
                  background: 'linear-gradient(135deg, #2d7a52 0%, #1e6b47 50%, #1a5f3f 100%)',
                  borderColor: 'rgba(249, 115, 22, 0.4)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                }}
              >
                {/* Product Image */}
                <div className="relative h-64 flex items-center justify-center overflow-hidden" style={{
                  background: 'linear-gradient(135deg, #1e6b47 0%, #2d7a52 100%)'
                }}>
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
                    <div className="w-full h-full flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #1e6b47 0%, #2d7a52 100%)'
                    }}>
                      <span className="text-white/60 text-sm font-medium">No Image</span>
                    </div>
                  )}
                  {/* Category Badge */}
                  {primaryCategory && primaryCategory !== 'Uncategorized' && (
                    <div className="absolute top-3 left-3">
                      <span className={`text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg ${
                        primaryCategory.toLowerCase().includes('fruit') ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                        primaryCategory.toLowerCase().includes('vegetable') ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        primaryCategory.toLowerCase().includes('drink') || primaryCategory.toLowerCase().includes('beverage') ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        primaryCategory.toLowerCase().includes('nut') ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                        primaryCategory.toLowerCase().includes('fish') || primaryCategory.toLowerCase().includes('seafood') ? 'bg-gradient-to-r from-cyan-500 to-teal-500' :
                        primaryCategory.toLowerCase().includes('meat') ? 'bg-gradient-to-r from-rose-500 to-red-500' :
                        'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        {primaryCategory}
                      </span>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex flex-col flex-grow">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-1">
                      {product.brand}
                    </p>
                  )}
                  
                  {/* Product Name */}
                  <h3 className="font-bold text-lg mb-2 text-white line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                  </h3>

                  {/* Quantity */}
                  {product.quantity && (
                    <p className="text-sm text-white/70 mb-3">
                      <span className="font-medium">Size:</span> {product.quantity}
                    </p>
                  )}

                  {/* Nutritional Info */}
                  {product.nutritionalInfo && (
                    <div className="mb-4 p-3 rounded-lg" style={{
                      background: 'rgba(92, 90, 85, 0.5)',
                      border: '1px solid rgb(255, 255, 255)'
                    }}>
                      <p className="text-xs font-semibold text-white mb-2">Nutrition (per 100g)</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {product.nutritionalInfo.energy > 0 && (
                          <div>
                            <span className="text-white/70">Energy:</span>
                            <span className="font-semibold ml-1 text-white">{product.nutritionalInfo.energy} kcal</span>
                          </div>
                        )}
                        {product.nutritionalInfo.fat > 0 && (
                          <div>
                            <span className="text-white/70">Fat:</span>
                            <span className="font-semibold ml-1 text-white">{product.nutritionalInfo.fat}g</span>
                          </div>
                        )}
                        {product.nutritionalInfo.carbs > 0 && (
                          <div>
                            <span className="text-white/70">Carbs:</span>
                            <span className="font-semibold ml-1 text-white">{product.nutritionalInfo.carbs}g</span>
                          </div>
                        )}
                        {product.nutritionalInfo.protein > 0 && (
                          <div>
                            <span className="text-white/70">Protein:</span>
                            <span className="font-semibold ml-1 text-white">{product.nutritionalInfo.protein}g</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price and Add to Cart */}
                  <div className="mt-auto pt-4" style={{
                    borderTop: '1px solid rgba(249, 115, 22, 0.2)'
                  }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-extrabold" style={{
                          background: 'linear-gradient(to right, #f97316, #ea580c)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          {formattedPrice}
                        </p>
                        {(!product.price || product.price === 0) && (
                          <p className="text-xs text-white/50 mt-1">Check store for price</p>
                        )}
                      </div>
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
                      onClick={() => addToCart(product)}
                    >
                      <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Add to Cart</span>
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
        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
          {selectedCategory !== 'all' && (
            <span> in <span className="font-semibold text-green-600">{selectedCategory}</span></span>
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors font-medium"
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

