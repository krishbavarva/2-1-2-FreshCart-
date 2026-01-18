import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserRole } from '../../utils/authHelpers';

const RoleBasedDashboard = () => {
  const { currentUser, loading } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole(currentUser);

  // Redirect based on role
  switch (role) {
    case 'customer':
      return <Navigate to="/dashboard" replace />;
    case 'rider':
    case 'employee': // Backward compatibility
      return <Navigate to="/rider" replace />;
    case 'manager':
      return <Navigate to="/manager" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/products" replace />;
  }
};

export default RoleBasedDashboard;

