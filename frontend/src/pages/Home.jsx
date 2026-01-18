import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    { name: 'Vegetables', icon: '🥬', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', color: 'from-emerald-500 to-green-600' },
    { name: 'Fruits', icon: '🍎', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', color: 'from-red-500 to-pink-600' },
    { name: 'Drinks', icon: '🥤', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', color: 'from-blue-500 to-cyan-600' },
    { name: 'Fresh Nuts', icon: '🥜', image: 'https://images.unsplash.com/photo-1599599810769-14c62916a1a3?w=400', color: 'from-amber-500 to-orange-600' },
    { name: 'Fresh Fish', icon: '🐟', image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', color: 'from-cyan-500 to-teal-600' },
    { name: 'Meat', icon: '🥩', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400', color: 'from-rose-500 to-red-600' },
  ];

  const features = [
    { icon: '🚚', title: 'Fast Delivery', desc: 'Get your groceries delivered within 40km range', gradient: 'from-blue-500 to-cyan-500' },
    { icon: '💳', title: 'Secure Payment', desc: 'Safe and secure payment with Stripe integration', gradient: 'from-purple-500 to-pink-500' },
    { icon: '📱', title: 'Easy Ordering', desc: 'Simple and intuitive shopping experience', gradient: 'from-orange-500 to-red-500' },
    { icon: '🌱', title: 'Fresh Products', desc: 'Quality guaranteed fresh products daily', gradient: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 via-emerald-500 to-teal-600 opacity-90"></div>
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-block mb-6 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                <span className="text-sm font-semibold">🛒 Fresh Groceries Delivered to Your Door</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="block bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                  FreshCart
                </span>
                <span className="block text-white text-4xl md:text-5xl lg:text-6xl mt-4 font-bold">
                  Your Daily Grocery Store
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
                Discover fresh, healthy groceries with complete nutritional information. 
                Fast delivery within 40km. Shop smart, live healthy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {currentUser ? (
                  <Link
                    to="/products"
                    className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-2"
                  >
                    <span>Start Shopping</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      to="/login"
                      className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why Choose <span className="text-blue-600">FreshCart</span>?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need for a seamless grocery shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Shop by <span className="text-emerald-600">Category</span>
            </h2>
            <p className="text-gray-600 text-lg">Browse our wide selection of fresh products</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to="/products"
                className="group text-center transform transition-all duration-300 hover:scale-110"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-4">
                  <div className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${category.color} p-4 shadow-lg group-hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm rounded-xl">
                      {category.icon}
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="py-20 bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-600">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to Start Shopping?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of happy customers and get fresh groceries delivered to your door
              </p>
              <Link
                to="/register"
                className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
