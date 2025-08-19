import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu as MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { foodAPI } from "@/lib/api";
import CartSheet from "@/components/cart/CartSheet";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import NotificationIcon from "@/components/NotificationIcon";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSearch = async (query) => {
    try {
      setIsSearching(true);
      
      // Try backend search first
      const response = await foodAPI.searchFoods(query);
      let foods = Array.isArray(response.data) ? response.data : [];
      
      // If backend returns all foods (not filtered), do frontend filtering as fallback
      if (foods.length > 0) {
        const queryLower = query.toLowerCase();
        const originalCount = foods.length;
        
        // Filter results on frontend if backend didn't filter
        const filteredFoods = foods.filter(food => 
          food.name?.toLowerCase().includes(queryLower) ||
          food.description?.toLowerCase().includes(queryLower) ||
          food.subCategory?.toLowerCase().includes(queryLower)
        );
        
        // If filtered results are significantly smaller, backend likely didn't filter
        if (filteredFoods.length < originalCount * 0.8) {
          foods = filteredFoods;
        }
        
        // Sort by relevance (exact match first, then starts with, then contains)
        foods = foods.sort((a, b) => {
          const aNameLower = a.name?.toLowerCase() || '';
          const bNameLower = b.name?.toLowerCase() || '';
          
          // Exact match
          if (aNameLower === queryLower && bNameLower !== queryLower) return -1;
          if (bNameLower === queryLower && aNameLower !== queryLower) return 1;
          
          // Starts with
          if (aNameLower.startsWith(queryLower) && !bNameLower.startsWith(queryLower)) return -1;
          if (bNameLower.startsWith(queryLower) && !aNameLower.startsWith(queryLower)) return 1;
          
          // Contains in name
          if (aNameLower.includes(queryLower) && !bNameLower.includes(queryLower)) return -1;
          if (bNameLower.includes(queryLower) && !aNameLower.includes(queryLower)) return 1;
          
          return 0;
        });
      }
      
      setSearchResults(foods.slice(0, 5)); // Limit to 5 results
      setShowSearchResults(foods.length > 0);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchResultClick = (foodId) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(`/food/${foodId}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo + Welcome */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="cursor-pointer">
              <img
                src="/lovable-uploads/6c5b80cf-9d75-46fb-a308-4f9f0704f8bf.png"
                alt="The OG House Logo"
                className="h-20 lg:h-20 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
            {isAuthenticated && (
              <span className="text-sm lg:text-base text-muted-foreground">
                Welcome {user?.role === 'admin' ? (
                  <span className="font-bold text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 px-3 py-1 rounded-full text-sm shadow-lg border border-yellow-300">
                    👑 Chef Parivash!
                  </span>
                ) : (
                  <span className="font-bold text-foreground">
                    {user?.name}
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
              <Input
                type="text"
                placeholder="Search for delicious food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 py-3 rounded-full border-2 border-primary/20 bg-card shadow-search focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:shadow-elegant"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Searching...
                    </div>
                  ) : (
                    <>
                      {searchResults.map((food) => (
                        <div
                          key={food._id}
                          onClick={() => handleSearchResultClick(food._id)}
                          className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">{food.name}</h4>
                              <p className="text-sm text-muted-foreground truncate">{food.description}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-sm font-semibold text-primary">₹{food.price}</span>
                                <Badge 
                                  variant={(food.mainCategory || food.category) === 'veg' ? 'secondary' : 'destructive'}
                                  className="text-xs"
                                >
                                  {(food.mainCategory || food.category) === 'veg' ? 'Veg' : 'Non-Veg'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {searchResults.length > 0 && (
                        <div className="p-2 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
                              clearSearch();
                            }}
                            className="w-full text-primary hover:text-primary/80"
                          >
                            View all results for "{searchQuery}"
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
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
            <Button 
              variant="ghost" 
              className="px-3 py-2 rounded-full"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full border-2 border-primary/20 bg-card shadow-search focus:border-primary"
            />
            
            {/* Mobile Search Results */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                ) : (
                  <>
                    {searchResults.map((food) => (
                      <div
                        key={food._id}
                        onClick={() => handleSearchResultClick(food._id)}
                        className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{food.name}</h4>
                            <p className="text-sm text-muted-foreground truncate">{food.description}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-sm font-semibold text-primary">₹{food.price}</span>
                              <Badge 
                                variant={(food.mainCategory || food.category) === 'veg' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {(food.mainCategory || food.category) === 'veg' ? 'Veg' : 'Non-Veg'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 0 && (
                      <div className="p-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigate(`/menu?search=${encodeURIComponent(searchQuery)}`);
                            clearSearch();
                          }}
                          className="w-full text-primary hover:text-primary/80"
                        >
                          View all results for "{searchQuery}"
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur">
            <div className="py-4 space-y-3">
              <Link 
                to="/menu" 
                className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                onClick={closeMobileMenu}
              >
                Menu
              </Link>

              {isAuthenticated && (
                <Link 
                  to="/my-orders" 
                  className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  My Orders
                </Link>
              )}

              {isAuthenticated && user?.role === "admin" && (
                <Link 
                  to="/admin" 
                  className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={closeMobileMenu}
                >
                  Admin Dashboard
                </Link>
              )}

              {!isAuthenticated ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAuthMode("login");
                    setShowAuth(true);
                    closeMobileMenu();
                  }}
                  className="w-full justify-start px-4 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg"
                >
                  Login / Register
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full justify-start px-4 py-3 rounded-lg"
                >
                  Logout
                </Button>
              )}

              <div className="px-4">
                <CartSheet>
                  <Button
                    variant="outline"
                    className="relative w-full justify-start px-4 py-3 text-sm rounded-lg"
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
              </div>

              {isAuthenticated && (
                <div className="px-4">
                  <NotificationIcon />
                </div>
              )}
            </div>
          </div>
        )}
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
              onSuccess={() => {
                // Only close dialog on successful login
                // Failed login attempts will keep the dialog open
                console.log('[Navbar] ✅ Login successful, closing auth dialog');
                setShowAuth(false);
              }}
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
