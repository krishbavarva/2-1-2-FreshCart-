/**
 * Get user role
 * @param {Object} currentUser - Current user object from AuthContext
 * @returns {string|null} - User role or null
 */
export const getUserRole = (currentUser) => {
  if (!currentUser) return null;
  return currentUser.user?.role || currentUser.role || null;
};

/**
 * Check if current user is customer
 * @param {Object} currentUser - Current user object from AuthContext
 * @returns {boolean} - True if user is customer
 */
export const isCustomer = (currentUser) => {
  if (!currentUser) return false;
  const userRole = getUserRole(currentUser);
  return userRole === 'customer';
};

/**
 * Check if current user is employee or higher
 * @param {Object} currentUser - Current user object from AuthContext
 * @returns {boolean} - True if user is employee, manager, or admin
 */
export const isEmployee = (currentUser) => {
  if (!currentUser) return false;
  const userRole = getUserRole(currentUser);
  return ['employee', 'manager', 'admin'].includes(userRole);
};

/**
 * Check if current user is manager or admin
 * @param {Object} currentUser - Current user object from AuthContext
 * @returns {boolean} - True if user is manager or admin
 */
export const isManager = (currentUser) => {
  if (!currentUser) return false;
  const userRole = getUserRole(currentUser);
  return userRole === 'manager' || userRole === 'admin';
};

/**
 * Check if current user is admin
 * @param {Object} currentUser - Current user object from AuthContext
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (currentUser) => {
  if (!currentUser) return false;
  const userRole = getUserRole(currentUser);
  return userRole === 'admin';
};

