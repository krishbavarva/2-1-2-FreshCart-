import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLikedProducts } from '../../contexts/LikedProductsContext';
import { isAdmin, isEmployee, isManager, getUserRole } from '../../utils/authHelpers';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();
  const { likedProductsCount } = useLikedProducts();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get user role and check permissions
  const userRole = getUserRole(currentUser);
  const userIsAdmin = isAdmin(currentUser);
  const userIsEmployee = isEmployee(currentUser);
  const userIsManager = isManager(currentUser);
  const userIsCustomer = userRole === 'customer';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'backdrop-blur-md shadow-lg' : 'shadow-md'
    }`}
    style={{
      background: scrolled ? 'rgba(37, 99, 235, 0.95)' : 'rgba(37, 99, 235, 1)'
    }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link 
            to="/" 
            className="text-3xl font-extrabold text-white hover:text-orange-400 transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-4xl animate-bounce">🛒</span>
            <span>FreshCart</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {currentUser ? (
              <>
                <Link 
                  to="/products" 
                  className="text-white hover:text-orange-400 font-semibold transition-all duration-200 relative group"
                >
                  Products
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link 
                  to="/protein-plan" 
                  className="text-white hover:text-orange-400 font-semibold transition-all duration-200 relative group"
                >
                  🤖 Protein Plan
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                {/* Role-based dashboard link */}
                {userIsCustomer && (
                  <Link 
                    to="/dashboard" 
                    className="text-white hover:text-orange-400 font-semibold transition-all duration-200 relative group"
                  >
                    Dashboard
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                {userIsEmployee && (
                  <Link 
                    to="/employee" 
                    className="text-white hover:text-orange-400 font-semibold transition-all duration-200 relative group"
                  >
                    Employee
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                {userIsManager && (
                  <Link 
                    to="/manager" 
                    className="text-white hover:text-orange-400 font-semibold transition-all duration-200 relative group"
                  >
                    Manager
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                {userIsAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-white hover:text-orange-400 font-semibold transition-all duration-200 relative group bg-orange-500/20 px-3 py-1 rounded-lg"
                  >
                    Admin
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                {/* Orders link - show for all authenticated users */}
                <Link 
                  to="/orders" 
                  className="text-white hover:text-orange-400 font-semibold transition-all duration-200 relative group"
                >
                  Orders
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                {/* Liked Products - for all authenticated users */}
                {currentUser && (
                  <Link 
                    to="/liked-products" 
                    className="relative text-white hover:text-orange-400 transition-all duration-200 p-2 hover:bg-white/10 rounded-lg group"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {likedProductsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                        {likedProductsCount > 9 ? '9+' : likedProductsCount}
                      </span>
                    )}
                  </Link>
                )}
                {/* Cart - only for customers */}
                {userIsCustomer && (
                  <Link 
                    to="/cart" 
                    className="relative text-white hover:text-orange-400 transition-all duration-200 p-2 hover:bg-white/10 rounded-lg group"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </Link>
                )}
                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {currentUser.user?.firstName?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="hidden lg:block">
                      <span className="text-white font-semibold block">
                        {currentUser.user?.firstName || currentUser.email?.split('@')[0]}
                      </span>
                      <span className="text-white/70 text-xs capitalize">
                        {userRole || 'User'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white px-5 py-2 rounded-lg hover:bg-white/10 transition-all font-semibold border-2 border-white/30 hover:border-orange-500"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-orange-400 font-semibold transition-all duration-200 px-4 py-2 rounded-lg hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white px-6 py-3 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slideDown">
            <nav className="flex flex-col space-y-4">
              {currentUser ? (
                <>
                  <Link 
                    to="/products" 
                    className="text-gray-700 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link 
                    to="/protein-plan" 
                    className="text-gray-700 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🤖 Protein Plan
                  </Link>
                  {/* Role-based dashboard links */}
                  {userIsCustomer && (
                    <Link 
                      to="/dashboard" 
                      className="text-gray-700 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {userIsEmployee && (
                    <Link 
                      to="/employee" 
                      className="text-gray-700 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Employee
                    </Link>
                  )}
                  {userIsManager && (
                    <Link 
                      to="/manager" 
                      className="text-gray-700 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manager
                    </Link>
                  )}
                  {userIsAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 hover:text-green-600 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors bg-orange-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link 
                    to="/orders" 
                    className="text-gray-700 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  {/* Liked Products - for all authenticated users */}
                  {currentUser && (
                    <Link 
                      to="/liked-products" 
                      className="text-gray-700 hover:text-pink-600 font-semibold px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Liked Products</span>
                      {likedProductsCount > 0 && (
                        <span className="bg-pink-500 text-white text-xs font-bold rounded-full px-2 py-1">
                          {likedProductsCount}
                        </span>
                      )}
                    </Link>
                  )}
                  {/* Cart - only for customers */}
                  {userIsCustomer && (
                    <Link 
                      to="/cart" 
                      className="text-gray-700 hover:text-green-600 font-semibold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>Cart</span>
                      {itemCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="px-4 py-2">
                      <div className="text-gray-700 font-semibold">
                        {currentUser.user?.firstName || currentUser.email}
                      </div>
                      <div className="text-gray-500 text-xs capitalize mt-1">
                        {userRole || 'User'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

