import React, { useState, useEffect } from 'react';
import { getAdminProducts, orderNewItems, getAdminCategories } from '../../services/adminService';
import toast from 'react-hot-toast';

const OrderNewItems = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderForm, setOrderForm] = useState({
    quantity: '',
    cost: '',
    supplier: {
      name: '',
      contact: '',
      email: ''
    },
    notes: ''
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [search, category, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAdminProducts({ lowStock: 'true' });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
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

  const filterProducts = () => {
    let filtered = products;

    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setOrderForm({
      quantity: Math.max(1, product.minStockLevel - product.stock + 10),
      cost: '',
      supplier: product.supplier || { name: '', contact: '', email: '' },
      notes: ''
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    if (!orderForm.quantity || parseFloat(orderForm.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      await orderNewItems({
        productId: selectedProduct.productId,
        quantity: parseFloat(orderForm.quantity),
        cost: orderForm.cost ? parseFloat(orderForm.cost) : 0,
        supplier: orderForm.supplier,
        notes: orderForm.notes
      });

      toast.success('Order placed successfully!');
      setSelectedProduct(null);
      setOrderForm({
        quantity: '',
        cost: '',
        supplier: { name: '', contact: '', email: '' },
        notes: ''
      });
      loadProducts();
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order New Items</h1>
        <p className="text-gray-600">Place orders to restock inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Product</h2>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleSelectProduct(product)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProduct?._id === product._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {product.image && (
                          <img src={product.image} alt={product.name} className="h-16 w-16 rounded object-cover" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-800">{product.name}</h3>
                          {product.brand && <p className="text-sm text-gray-600">{product.brand}</p>}
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          product.stock <= product.minStockLevel ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          Stock: {product.stock} / {product.minStockLevel} (min)
                        </div>
                        <div className="text-sm text-gray-500">${product.price?.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">No products found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
            
            {selectedProduct ? (
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-600">Current Stock: {selectedProduct.stock}</p>
                    <p className="text-sm text-gray-600">Min Level: {selectedProduct.minStockLevel}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost (Optional)</label>
                  <input
                    type="number"
                    value={orderForm.cost}
                    onChange={(e) => setOrderForm({ ...orderForm, cost: e.target.value })}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                  <input
                    type="text"
                    value={orderForm.supplier.name}
                    onChange={(e) => setOrderForm({
                      ...orderForm,
                      supplier: { ...orderForm.supplier, name: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Contact</label>
                  <input
                    type="text"
                    value={orderForm.supplier.contact}
                    onChange={(e) => setOrderForm({
                      ...orderForm,
                      supplier: { ...orderForm.supplier, contact: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Email</label>
                  <input
                    type="email"
                    value={orderForm.supplier.email}
                    onChange={(e) => setOrderForm({
                      ...orderForm,
                      supplier: { ...orderForm.supplier, email: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Place Order
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null);
                    setOrderForm({
                      quantity: '',
                      cost: '',
                      supplier: { name: '', contact: '', email: '' },
                      notes: ''
                    });
                  }}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Select a product from the list to place an order</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNewItems;




