import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart.js';
import { cartAPI } from '@/lib/api.js';
import { toast } from 'sonner';
import CheckoutForm from './CheckoutForm.jsx';

const CartSheet = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { totalItems, refreshCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    } else {
      // Reset checkout view when sheet is closed
      setShowCheckout(false);
    }
  }, [isOpen]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response.data?.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (foodId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await cartAPI.updateQuantity(foodId, newQuantity);
      await fetchCart();
      refreshCart();
      toast.success('Cart updated successfully');
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (foodId) => {
    try {
      await cartAPI.removeItem(foodId);
      await fetchCart();
      refreshCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      refreshCart();
      toast.success('Cart cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.food?.price || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setShowCheckout(true);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  const handleCheckoutSuccess = (orderData) => {
    setShowCheckout(false);
    setIsOpen(false);
    setCartItems([]);
    toast.success('Order placed successfully!');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className={`w-full ${showCheckout ? 'sm:max-w-4xl' : 'sm:max-w-md'}`}>
        {!showCheckout && (
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              Shopping Cart
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {totalItems}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
        )}

        {showCheckout ? (
          <div className="h-full overflow-y-auto">
            <CheckoutForm 
              onBack={handleBackFromCheckout}
              onSuccess={handleCheckoutSuccess}
            />
          </div>
        ) : (
          <div className="flex flex-col h-full">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm sm:text-base text-muted-foreground">Loading cart...</p>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 sm:py-12">
              <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                Your cart is empty
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                Add some delicious items to get started
              </p>
              <Button onClick={() => setIsOpen(false)} variant="outline" className="text-xs sm:text-sm">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-3 sm:py-4 space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                    <img
                      src={item.food?.image || item.image}
                      alt={item.food?.name || item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate text-sm sm:text-base">
                        {item.food?.name || item.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        ₹{item.food?.price || item.price || 0} each
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.food?._id || item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full"
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          
                          <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.food?._id || item._id, item.quantity + 1)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="font-semibold text-primary text-sm sm:text-base">
                            ₹{(item.food?.price || item.price || 0) * item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.food?._id || item._id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">Total ({getTotalItems()} items)</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">₹{calculateTotal()}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    size="default"
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full flex items-center justify-center flex-1"
                  >
                    Clear Cart
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    size="default"
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full flex items-center justify-center flex-1"
                  >
                    Checkout
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  </Button>
                </div>
                
                <Button 
                  onClick={() => setIsOpen(false)} 
                  variant="outline" 
                  size="default"
                  className="w-full py-2 sm:py-3 text-xs sm:text-sm rounded-full flex items-center justify-center"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
