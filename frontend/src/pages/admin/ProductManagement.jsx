import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAdminProducts, updateStock, updatePrice, getAdminCategories } from '../../services/adminService';
import NutriScoreBadge from '../../components/common/NutriScoreBadge';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [lowStock, setLowStock] = useState(false);
  const [outOfStock, setOutOfStock] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockOperation, setStockOperation] = useState('set');
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceValue, setPriceValue] = useState('');

  // Read URL parameters on mount and when they change
  useEffect(() => {
    const lowStockParam = searchParams.get('lowStock');
    const outOfStockParam = searchParams.get('outOfStock');
    const statusParam = searchParams.get('status');

    if (lowStockParam === 'true') {
      setLowStock(true);
      setOutOfStock(false);
      setStatus('all');
    } else if (outOfStockParam === 'true' || statusParam === 'out_of_stock') {
      setOutOfStock(true);
      setLowStock(false);
      setStatus('out_of_stock');
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [search, category, status, lowStock, outOfStock]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (status !== 'all') params.status = status;
      if (lowStock) params.lowStock = 'true';
      if (outOfStock) params.status = 'out_of_stock';

      const data = await getAdminProducts(params);
      setProducts(data.products || []);
      
      if (!data.products || data.products.length === 0) {
        setError('No products found. Please sync products from the API.');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load products';
      setError(errorMessage);
      toast.error(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getAdminCategories();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleUpdateStock = async (productId) => {
    if (!stockQuantity || isNaN(stockQuantity) || parseFloat(stockQuantity) < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      await updateStock(productId, {
        quantity: parseFloat(stockQuantity),
        operation: stockOperation
      });
      toast.success('Stock updated successfully');
      setEditingStock(null);
      setStockQuantity('');
      loadProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleUpdatePrice = async (productId) => {
    if (!priceValue || isNaN(priceValue) || parseFloat(priceValue) < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await updatePrice(productId, parseFloat(priceValue));
      toast.success('Price updated successfully');
      setEditingPrice(null);
      setPriceValue('');
      loadProducts();
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error(error.response?.data?.message || 'Failed to update price');
    }
  };

  const getStockStatusColor = (product) => {
    if (product.stock === 0) return 'text-red-600 bg-red-50';
    if (product.stock > 0 && product.stock < 30) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getStockStatusText = (product) => {
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock > 0 && product.stock < 30) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
          <p className="text-gray-600">Manage product inventory and stock levels</p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (e.target.value === 'out_of_stock') {
                    setOutOfStock(true);
                    setLowStock(false);
                  } else {
                    setOutOfStock(false);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex flex-col items-start space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStock}
                  onChange={(e) => {
                    setLowStock(e.target.checked);
                    if (e.target.checked) {
                      setOutOfStock(false);
                      setStatus('all');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Low Stock Only (&lt; 30)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={outOfStock}
                  onChange={(e) => {
                    setOutOfStock(e.target.checked);
                    if (e.target.checked) {
                      setLowStock(false);
                      setStatus('out_of_stock');
                    } else {
                      setStatus('all');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Out of Stock Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Products Table Card */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Loading products...</span>
            </div>
          </div>
        ) : error && products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadProducts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Nutri-Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No products found matching your filters
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {product.image && (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="h-10 w-10 rounded object-cover mr-3 border border-gray-200" 
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.brand && (
                                <div className="text-sm text-gray-500">{product.brand}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category || 'Uncategorized'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingPrice === product._id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                placeholder="Price"
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                                min="0"
                                step="0.01"
                              />
                              <button
                                onClick={() => handleUpdatePrice(product._id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPrice(null);
                                  setPriceValue('');
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-gray-900">${product.price?.toFixed(2) || '0.00'}</div>
                              <button
                                onClick={() => {
                                  setEditingPrice(product._id);
                                  setPriceValue(product.price?.toString() || '0');
                                }}
                                className="text-xs text-blue-600 hover:text-blue-900 font-medium mt-1"
                              >
                                Edit Price
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <NutriScoreBadge grade={product.nutriscoreGrade} size="md" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingStock === product._id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={stockOperation}
                                onChange={(e) => setStockOperation(e.target.value)}
                                className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                              >
                                <option value="set">Set</option>
                                <option value="add">Add</option>
                                <option value="subtract">Subtract</option>
                              </select>
                              <input
                                type="number"
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(e.target.value)}
                                placeholder="Qty"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                                min="0"
                              />
                              <button
                                onClick={() => handleUpdateStock(product._id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStock(null);
                                  setStockQuantity('');
                                }}
                                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.stock || 0} {product.unit || 'piece'}</div>
                              <div className="text-xs text-gray-500">Threshold: 30</div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product)}`}>
                            {getStockStatusText(product)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              setEditingStock(product._id);
                              setStockQuantity(product.stock?.toString() || '0');
                              setStockOperation('set');
                            }}
                            className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
