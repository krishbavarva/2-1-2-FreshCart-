import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isCustomer, isManager, getUserRole } from '../../utils/authHelpers';

const CustomerOrManagerRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = getUserRole(currentUser);
  
  // Only allow customers and managers (not riders or admins)
  if (!isCustomer(currentUser) && !isManager(currentUser)) {
    // Redirect riders to their dashboard
    if (userRole === 'rider' || userRole === 'employee') {
      return <Navigate to="/rider" replace />;
    }
    // Redirect admins to admin dashboard
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    // Default redirect
    return <Navigate to="/" replace />;
  }

  return children;
};

export default CustomerOrManagerRoute;


