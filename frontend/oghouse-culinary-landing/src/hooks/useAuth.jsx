import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
          console.debug('[Auth] Restored user from localStorage:', JSON.parse(userData));
        } catch (error) {
          console.error('[Auth] Failed to parse user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    console.log('[useAuth] Login attempt started for:', email);
    setIsLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      console.log('[useAuth] API response received:', res);

      // ✅ Check for actual token + user
      if (res?.data?.token && res?.data?.user) {
        console.log('[useAuth] ✅ Login successful - token and user found');
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);

        toast.success('Login successful!');
        console.log('[useAuth] Navigating to homepage...');
        navigate('/'); // redirect home only on successful login
        return true;
      }

      console.log('[useAuth] ❌ Login failed: missing token or user in response');
      console.log('[useAuth] Response data:', res?.data);
      // If no token/user in response, treat as login failure
      return false;
    } catch (error) {
      console.error('[useAuth] ❌ Login error caught:', error);
      console.error('[useAuth] Error response:', error.response);
      console.error('[useAuth] Error status:', error.response?.status);
      console.error('[useAuth] Error message:', error.message);
      
      // Re-throw the error so the form can handle it appropriately
      // Don't navigate on error - let the form handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register({ name, email, password });

      if (res?.data?.token && res?.data?.user) {
        toast.success('Registration successful!');
        return res.data; // ✅ return user + token + message
      }

      // If no token/user in response, treat as registration failure
      return null;
    } catch (error) {
      console.error('[Auth] Registration error:', error);
      
      // Re-throw the error so the form can handle it appropriately
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const openAuthDialog = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthDialog(true);
  };

  const closeAuthDialog = () => {
    setShowAuthDialog(false);
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isLoading, 
        login, 
        register, 
        logout, 
        isAuthenticated: !!user,
        showAuthDialog,
        authMode,
        openAuthDialog,
        closeAuthDialog
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
