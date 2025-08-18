import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
    try {
      const res = await authAPI.login({ email, password });

      // ✅ Check for actual token + user
      if (res?.data?.token && res?.data?.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);

        toast.success('Login successful!');
        navigate('/'); // redirect home
        return true;
      }

      toast.error('Login failed: token/user missing');
      return false;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
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

    toast.error('Registration failed');
    return null;
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    toast.error(error.response?.data?.message || 'Registration failed');
    return null;
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

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, isAuthenticated: !!user }}
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
