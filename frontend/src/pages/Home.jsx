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
    { name: 'Vegetables', icon: '🥬', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', color: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-400' },
    { name: 'Fruits', icon: '🍎', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400', color: 'from-red-500 to-pink-500', borderColor: 'border-red-400' },
    { name: 'Drinks', icon: '🥤', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', color: 'from-blue-500 to-cyan-500', borderColor: 'border-blue-400' },
    { name: 'Fresh Nuts', icon: '🥜', image: 'https://images.unsplash.com/photo-1599599810769-14c62916a1a3?w=400', color: 'from-amber-500 to-orange-500', borderColor: 'border-amber-400' },
    { name: 'Fresh Fish', icon: '🐟', image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', color: 'from-cyan-500 to-teal-500', borderColor: 'border-cyan-400' },
    { name: 'Meat', icon: '🥩', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400', color: 'from-rose-500 to-red-500', borderColor: 'border-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 via-purple-50 to-pink-50 overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 60% 40%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 90% 70%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>
      {/* Hero Section with Parallax */}
      <div className="relative overflow-hidden text-white min-h-[90vh] flex items-center z-10" style={{
        background: 'linear-gradient(135deg, #1a5f3f 0%, #2d7a52 50%, #1e6b47 100%)'
      }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>
          <div className="absolute top-1/3 left-1/3 w-60 h-60 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-5000"></div>
        </div>

        {/* Floating Product Images */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block overflow-hidden">
          <div className="relative h-full" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
            <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 backdrop-blur-md rounded-2xl p-4 animate-float">
              <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200" alt="Fruits" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="absolute top-40 left-10 w-28 h-28 bg-white/10 backdrop-blur-md rounded-2xl p-3 animate-float animation-delay-2000">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200" alt="Vegetables" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="absolute bottom-40 right-32 w-36 h-36 bg-white/10 backdrop-blur-md rounded-2xl p-4 animate-float animation-delay-4000">
              <img src="https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=200" alt="Fish" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl p-3 animate-float animation-delay-6000">
              <img src="https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=200" alt="Meat" className="w-full h-full object-cover rounded-xl" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight">
                <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-gradient">
                  HEALTHY AND
                </span>
                <span className="block bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent animate-gradient animation-delay-2000">
                  FRESH GROCERY
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-10 text-blue-100 leading-relaxed font-light">
                WE PRIDE OURSELVES ON PROVIDING A CURATED SELECTION OF THE FINEST, NUTRIENT-RICH PRODUCTS THAT CATER TO YOUR HEALTH CONSCIOUS LIFESTYLE.
              </p>
              {currentUser ? (
                <Link
                  to="/products"
                  className="inline-block px-12 py-4 rounded-xl font-bold text-lg shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden group text-white"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>🛒</span>
                    <span>SHOP NOW</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    className="inline-block px-12 py-4 rounded-xl font-bold text-lg shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden group text-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4)'
                    }}
                  >
                    <span className="relative z-10">GET STARTED</span>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-block bg-transparent border-2 border-white text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-800 shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    LOGIN
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Category Section */}
      <div className="py-20 relative overflow-hidden z-10" style={{
        background: 'linear-gradient(180deg, #1e6b47 0%, #2d7a52 50%, #1a5f3f 100%)'
      }}>
        {/* Natural Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-emerald-300 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-300 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-left mb-12 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-6xl md:text-7xl font-black text-white mb-4">
              CATEGORY
            </h2>
            <div className="w-24 h-1" style={{
              background: 'linear-gradient(to right, #f97316, #ea580c)'
            }}></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to="/products"
                className={`group transform transition-all duration-500 hover:scale-110 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  {/* Circular Image Container */}
                  <div 
                    className="relative w-full aspect-square rounded-full overflow-hidden shadow-2xl transition-all duration-500 border-4 group-hover:border-opacity-100"
                    style={{
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      borderColor: 'rgba(249, 115, 22, 0.3)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 transition-all duration-500"
                      style={{
                        background: `linear-gradient(to bottom right, ${category.color.includes('blue') ? 'rgba(59, 130, 246, 0.2)' : category.color.includes('red') ? 'rgba(239, 68, 68, 0.2)' : category.color.includes('blue') ? 'rgba(59, 130, 246, 0.2)' : category.color.includes('amber') ? 'rgba(245, 158, 11, 0.2)' : category.color.includes('cyan') ? 'rgba(6, 182, 212, 0.2)' : 'rgba(244, 63, 94, 0.2)'}, ${category.color.includes('blue') ? 'rgba(99, 102, 241, 0.2)' : category.color.includes('red') ? 'rgba(236, 72, 153, 0.2)' : category.color.includes('blue') ? 'rgba(99, 102, 241, 0.2)' : category.color.includes('amber') ? 'rgba(251, 146, 60, 0.2)' : category.color.includes('cyan') ? 'rgba(20, 184, 166, 0.2)' : 'rgba(244, 63, 94, 0.2)'})`
                      }}
                    ></div>
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
                      {category.icon}
                    </div>
                  </div>
                  
                  {/* Category Name */}
                  <div className="mt-4 text-center">
                    <h3 
                      className="text-lg font-bold text-white transition-all duration-300"
                      style={{
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#f97316';
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'white';
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      {category.name.toUpperCase()}
                    </h3>
                  </div>

                  {/* Hover Effect Ring */}
                  <div 
                    className="absolute inset-0 rounded-full border-4 opacity-0 group-hover:opacity-100 scale-110 transition-all duration-500 pointer-events-none"
                    style={{
                      borderColor: '#f97316'
                    }}
                  ></div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-12">
            {[
              { active: true },
              { active: false },
              { active: false },
              { active: false },
              { active: false }
            ].map((dot, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: dot.active ? '#f97316' : 'rgba(255, 255, 255, 0.3)',
                  transform: dot.active ? 'scale(1.25)' : 'scale(1)',
                  opacity: dot.active ? 1 : 0.6
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section with Glassmorphism */}
      <div className="relative py-20 overflow-hidden z-10" style={{
        background: 'linear-gradient(180deg, #1a5f3f 0%, #1e6b47 50%, #2d7a52 100%)'
      }}>
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-3000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
          <div className="absolute top-1/4 right-1/3 w-88 h-88 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-5000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-5xl font-black text-center mb-16 text-white">
            WHY CHOOSE <span style={{ color: '#f97316' }}>FRESHCART</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🛒', title: 'Wide Selection', desc: 'Browse thousands of products from Open Food Facts with detailed nutritional information', color: 'from-blue-400 to-cyan-600', bgColor: 'from-blue-50 to-cyan-50' },
              { icon: '🔒', title: 'Secure Shopping', desc: 'Your data is protected with JWT authentication and secure payment processing', color: 'from-blue-400 to-indigo-600', bgColor: 'from-blue-50 to-indigo-50' },
              { icon: '📱', title: 'Easy to Use', desc: 'Simple and intuitive interface designed for the best shopping experience', color: 'from-purple-400 to-pink-600', bgColor: 'from-purple-50 to-pink-50' }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="backdrop-blur-lg rounded-3xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:rotate-1 border-2 hover:border-opacity-100"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(249, 115, 22, 0.3)',
                  transitionDelay: `${index * 150}ms`,
                  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                  opacity: isVisible ? 1 : 0
                }}
              >
                <div className={`w-24 h-24 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-5xl shadow-lg transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1a5f3f 0%, #1e6b47 100%)'
      }}>
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 animate-pulse-slow">
              SHOP SMART, LIVE HEALTHY
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Discover products with complete nutritional information, track your purchase history, 
              and enjoy a seamless shopping experience from cart to checkout.
            </p>
            {!currentUser && (
              <Link
                to="/register"
                className="inline-block bg-white text-blue-700 px-12 py-5 rounded-xl font-bold text-lg hover:bg-blue-50 shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">CREATE ACCOUNT NOW</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-cyan-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

