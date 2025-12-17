import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (accessToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Ensure permissions are loaded from localStorage
        const storedPermissions = localStorage.getItem('permissions');
        if (storedPermissions) {
          parsedUser.permissions = JSON.parse(storedPermissions);
        }
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { user: userData, accessToken, refreshToken } = response.data;

      // Validate that we received tokens
      if (!accessToken) {
        console.error('No access token received from server');
        return {
          success: false,
          message: 'Login failed: No access token received',
        };
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Store permissions separately for quick access
      if (userData.permissions) {
        localStorage.setItem('permissions', JSON.stringify(userData.permissions));
      } else {
        // If no permissions in response, try to get them from user object
        const permissions = userData.permissions || [];
        localStorage.setItem('permissions', JSON.stringify(permissions));
      }

      setUser(userData);
      
      // Verify token is stored
      const storedToken = localStorage.getItem('accessToken');
      if (!storedToken) {
        console.error('Failed to store access token');
        return {
          success: false,
          message: 'Login failed: Could not store token',
        };
      }

      // Debug: Log user permissions
      console.log('Login successful:', {
        username: userData.username,
        role: userData.role,
        permissions: userData.permissions,
        permissionsCount: userData.permissions?.length || 0,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions');
      setUser(null);
    }
  };

  // Helper function to check if user has permission
  const hasPermission = (permissionCode) => {
    if (!user) return false;
    // Admin has all permissions
    if (user.role === 'ADMIN') return true;
    // Check if user has the specific permission
    const permissions = user.permissions || [];
    if (!Array.isArray(permissions)) {
      console.warn('User permissions is not an array:', permissions);
      return false;
    }
    return permissions.includes(permissionCode);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

