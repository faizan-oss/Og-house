import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const LoginForm = ({ onSwitchToRegister, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginSuccessful, setLoginSuccessful] = useState(false);
  const { login } = useAuth();

  // Prevent accidental form closure
  useEffect(() => {
    if (loginSuccessful) {
      console.log('[LoginForm] 🎯 Login confirmed successful, allowing form closure');
    } else {
      console.log('[LoginForm] 🚫 Login not successful, preventing form closure');
    }
  }, [loginSuccessful]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      console.log('[LoginForm] 🚀 Attempting login...');
      const success = await login(email, password);
      console.log('[LoginForm] 📋 Login result:', success);
      console.log('[LoginForm] 📋 Success type:', typeof success);
      console.log('[LoginForm] 📋 Success value:', success);
      
      // Only call onSuccess if login was actually successful
      if (success === true) {
        console.log('[LoginForm] ✅ Login successful, closing form...');
        // Login was successful, form will close and redirect happens in useAuth
        // Clear any existing errors before closing
        setErrors({});
        setLoginSuccessful(true);
        onSuccess?.();
        return; // Exit early on success
      } else {
        console.log('[LoginForm] ❌ Login failed, keeping form open...');
        // Login failed but no error was thrown (e.g., missing token/user in response)
        setErrors({ general: 'Login failed. Please check your credentials and try again.' });
        setLoginSuccessful(false);
        // Form stays open - no navigation
        return;
      }
    } catch (error) {
      console.error('[LoginForm] ❌ Login error caught:', error);
      console.error('[LoginForm] Error response:', error.response);
      console.error('[LoginForm] Error status:', error.response?.status);
      
      // Handle specific error cases - form stays open
      if (error.response?.status === 401) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (error.response?.status === 404) {
        setErrors({ general: 'User not found. Please check your email or create an account.' });
      } else if (error.response?.status === 500) {
        setErrors({ general: 'Server error. Please try again later.' });
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.message) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Login failed. Please try again later.' });
      }
      
      console.log('[LoginForm] ❌ Login failed, keeping form open with errors...');
      console.log('[LoginForm] Current errors:', errors);
      // Form stays open - no navigation on error
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear general error when user makes any change
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
    
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error Message */}
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-destructive focus:border-destructive' : ''}`}
                required
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-primary"
              onClick={onSwitchToRegister}
            >
              Sign up now
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
