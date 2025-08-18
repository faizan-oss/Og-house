import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Menu as MenuIcon } from "lucide-react";
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
  const [authMode, setAuthMode] = useState("login");
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo + Welcome */}
          <div className="flex items-center space-x-4">
            <img
              src="/lovable-uploads/6c5b80cf-9d75-46fb-a308-4f9f0704f8bf.png"
              alt="The OG House Logo"
              className="h-20 lg:h-20 w-auto"
            />
            {isAuthenticated && (
              <span className="text-sm lg:text-base text-muted-foreground">
                Welcome, <span className="font-semibold">{user?.user}</span>
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for delicious food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-full border-2 border-primary/20 bg-card shadow-search focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:shadow-elegant"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/menu">
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary font-medium text-sm px-4 py-2 rounded-full"
              >
                Menu
              </Button>
            </Link>

            {isAuthenticated && (
              <Link to="/my-orders">
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary font-medium text-sm px-4 py-2 rounded-full"
                >
                  My Orders
                </Button>
              </Link>
            )}

            {isAuthenticated && user?.role === "admin" && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary font-medium text-sm px-4 py-2 rounded-full"
                >
                  Admin
                </Button>
              </Link>
            )}

            {!isAuthenticated ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuth(true);
                }}
                className="text-foreground hover:text-primary font-medium text-sm px-4 py-2 rounded-full"
              >
                Login / Register
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={logout}
                className="px-4 py-2 rounded-full"
              >
                Logout
              </Button>
            )}

            <CartSheet>
              <Button
                variant="outline"
                className="relative px-4 py-2 text-sm rounded-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </CartSheet>

            {isAuthenticated && <NotificationIcon />}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button variant="ghost" className="px-3 py-2 rounded-full">
              <MenuIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full border-2 border-primary/20 bg-card shadow-search focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="sr-only">Authentication</DialogTitle>
          <DialogDescription className="sr-only">
            {authMode === "login" ? "Login form" : "Registration form"}
          </DialogDescription>

          {authMode === "login" ? (
            <LoginForm
              onSwitchToRegister={() => setAuthMode("register")}
              onSuccess={() => setShowAuth(false)} // close after login -> will navigate to landing inside LoginForm
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setAuthMode("login")} // switch after success
            />
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
