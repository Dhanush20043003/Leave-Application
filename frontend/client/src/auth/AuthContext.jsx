import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthCtx = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('user');
      return null;
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Check if user is still valid on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.log('Token expired or invalid, logging out');
          logout();
        }
      }
      setInitialized(true);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { 
        email: email.trim(), 
        password 
      });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      console.log('Login successful:', data.user);
      return { ok: true, user: data.user };
    } catch (error) {
      console.error('Login failed:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', userData);
      console.log('Registration successful:', data);
      return { ok: true, message: 'Registration successful! Please log in.' };
    } catch (error) {
      console.error('Registration failed:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('User logged out');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    initialized
  };

  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};