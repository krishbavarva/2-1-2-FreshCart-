import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/authHelpers';
import toast from 'react-hot-toast';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && currentUser && !isAdmin(currentUser)) {
      toast.error('Access denied. Admin privileges required.');
    }
  }, [currentUser, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin or manager
  if (!isAdmin(currentUser)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

