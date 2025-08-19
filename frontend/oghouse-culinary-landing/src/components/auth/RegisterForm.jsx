import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await register(name, email, password);

      // ✅ Treat as success if API returned a user object
      if (response?.user) {
        toast.success(response.message || "Registration successful! Please sign in.");
        // Only switch to login form after successful registration
        onSwitchToLogin();
        return; // Exit early on success
      } else {
        // Registration failed - form stays open with error message
        setErrors({ general: response?.message || "Registration failed. Please try again." });
        // Form stays open - no navigation
        return;
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases - form stays open
      if (error.response?.status === 409) {
        setErrors({ email: 'An account with this email already exists. Please sign in instead.' });
      } else if (error.response?.status === 400) {
        setErrors({ general: error.response.data.message || 'Invalid registration data. Please check your information.' });
      } else if (error.response?.status === 500) {
        setErrors({ general: 'Server error. Please try again later.' });
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.message) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Registration failed. Please try again later.' });
      }
      
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
    
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Join our community to get started</CardDescription>
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

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 ${errors.name ? 'border-destructive focus:border-destructive' : ''}`}
                required
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password">Password (min 6 characters)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive focus:border-destructive' : ''}`}
                required
                minLength={6}
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

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive focus:border-destructive' : ''}`}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-primary"
              onClick={onSwitchToLogin}
            >
              Sign in here
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
