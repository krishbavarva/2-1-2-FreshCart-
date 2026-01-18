import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { getProteinPlan } from '../services/proteinPlanService';
import NutriScoreBadge from '../components/common/NutriScoreBadge';
import toast from 'react-hot-toast';

const ProteinPlanBot = () => {
  const { addToCart } = useCart();
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintenance'
  });
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.age || !formData.weight || !formData.height) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const data = await getProteinPlan(formData);
      setPlan(data);
      toast.success('Protein plan generated successfully!');
    } catch (error) {
      console.error('Error generating protein plan:', error);
      toast.error(error.response?.data?.message || 'Failed to generate protein plan');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (product.stock === 0 || product.status === 'out_of_stock') {
      toast.error('This product is out of stock');
      return;
    }

    try {
      await addToCart(product);
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Cannot add to cart');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🤖 AI Protein Plan Bot</h1>
          <p className="text-gray-600">Get personalized protein recommendations for breakfast, lunch, and dinner</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Form Section */}
          {!plan && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                      Age (years) *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      min="1"
                      max="120"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) *
                    </label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="1"
                      step="0.1"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm) *
                    </label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      min="50"
                      max="250"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                    <option value="active">Active (exercise 6-7 days/week)</option>
                    <option value="very_active">Very Active (intense exercise daily)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                    Goal
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="maintenance">Maintain Weight</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="weight_loss">Weight Loss</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Generating Plan...' : 'Generate Protein Plan'}
                </button>
              </form>
            </div>
          )}

          {/* Plan Results */}
          {plan && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Your Protein Plan Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm">Daily Protein Need</p>
                    <p className="text-3xl font-bold">{plan.dailyProteinNeed.toFixed(1)}g</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Breakfast</p>
                    <p className="text-3xl font-bold">{plan.breakfast.proteinTarget.toFixed(1)}g</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Lunch</p>
                    <p className="text-3xl font-bold">{plan.lunch.proteinTarget.toFixed(1)}g</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-blue-100 text-sm">Dinner</p>
                  <p className="text-3xl font-bold">{plan.dinner.proteinTarget.toFixed(1)}g</p>
                </div>
                <button
                  onClick={() => {
                    setPlan(null);
                    setFormData({
                      age: '',
                      weight: '',
                      height: '',
                      activityLevel: 'moderate',
                      goal: 'maintenance'
                    });
                  }}
                  className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Generate New Plan
                </button>
              </div>

              {/* Breakfast */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🌅 Breakfast
                  <span className="text-lg font-normal text-gray-600">
                    (Target: {plan.breakfast.proteinTarget.toFixed(1)}g protein)
                  </span>
                </h3>
                {plan.breakfast.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plan.breakfast.products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-contain mb-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                        {product.brand && (
                          <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            {product.protein}g protein
                          </span>
                          {product.nutriscoreGrade && (
                            <NutriScoreBadge grade={product.nutriscoreGrade} size="sm" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price?.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {product.stock || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0 || product.status === 'out_of_stock'}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No products found matching the criteria.</p>
                )}
              </div>

              {/* Lunch */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🍽️ Lunch
                  <span className="text-lg font-normal text-gray-600">
                    (Target: {plan.lunch.proteinTarget.toFixed(1)}g protein)
                  </span>
                </h3>
                {plan.lunch.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plan.lunch.products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-contain mb-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                        {product.brand && (
                          <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            {product.protein}g protein
                          </span>
                          {product.nutriscoreGrade && (
                            <NutriScoreBadge grade={product.nutriscoreGrade} size="sm" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price?.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {product.stock || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0 || product.status === 'out_of_stock'}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No products found matching the criteria.</p>
                )}
              </div>

              {/* Dinner */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🌙 Dinner
                  <span className="text-lg font-normal text-gray-600">
                    (Target: {plan.dinner.proteinTarget.toFixed(1)}g protein)
                  </span>
                </h3>
                {plan.dinner.products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plan.dinner.products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-contain mb-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                        {product.brand && (
                          <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-600">
                            {product.protein}g protein
                          </span>
                          {product.nutriscoreGrade && (
                            <NutriScoreBadge grade={product.nutriscoreGrade} size="sm" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.price?.toFixed(2) || '0.00'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Stock: {product.stock || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0 || product.status === 'out_of_stock'}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-semibold"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No products found matching the criteria.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProteinPlanBot;

