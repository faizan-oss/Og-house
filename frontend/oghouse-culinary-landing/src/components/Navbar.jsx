import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu as MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import CartSheet from "@/components/cart/CartSheet";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import NotificationIcon from "@/components/NotificationIcon";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo and navigation links */}
          {/* ... (keep your existing navbar structure) ... */}
          
          {!isAuthenticated ? (
            <Button 
              variant="ghost" 
              onClick={() => {
                setAuthMode('login');
                setShowAuth(true);
              }}
              className="text-foreground hover:text-primary font-medium text-sm px-4 py-2 rounded-full"
            >
              Login / Register
            </Button>
          ) : (
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          )}
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Authentication</DialogTitle>
          <DialogDescription className="sr-only">
            {authMode === 'login' ? 'Login form' : 'Registration form'}
          </DialogDescription>
          
          {authMode === 'login' ? (
            <LoginForm 
              onSwitchToRegister={() => setAuthMode('register')}
              onSuccess={() => setShowAuth(false)}
            />
          ) : (
            <RegisterForm 
              onSwitchToLogin={() => setAuthMode('login')}
              onSuccess={() => {
                setAuthMode('login');
                toast.success('Registration successful! Please login');
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;