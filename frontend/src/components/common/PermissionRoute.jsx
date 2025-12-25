import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PermissionRoute = ({ children, permission, requireAdmin = false, fallback = '/dashboard' }) => {
  const { isAuthenticated, loading, hasPermission, user } = useAuth();

  console.log('🔒 PermissionRoute:', { permission, requireAdmin, isAuthenticated, loading, hasPermission: permission ? hasPermission(permission) : 'N/A' });

  if (loading) {
    console.log('⏳ PermissionRoute: Loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 PermissionRoute: Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // If requireAdmin is true, only ADMIN can access
  if (requireAdmin && user?.role !== 'ADMIN') {
    // For non-admin users, redirect to a page they can access
    const userPermissions = user?.permissions || [];
    if (userPermissions.includes('pos.use')) {
      return <Navigate to="/pos" replace />;
    } else if (userPermissions.includes('dashboard.view')) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/pos" replace />;
  }

  // Check permission if provided
  if (permission && !hasPermission(permission)) {
    // If user doesn't have permission, redirect to a page they can access
    const userPermissions = user?.permissions || [];
    if (userPermissions.includes('pos.use')) {
      return <Navigate to="/pos" replace />;
    } else if (userPermissions.includes('dashboard.view')) {
      return <Navigate to="/dashboard" replace />;
    }
    // Last resort: redirect to POS (most basic permission)
    return <Navigate to="/pos" replace />;
  }

  return children;
};

export default PermissionRoute;

