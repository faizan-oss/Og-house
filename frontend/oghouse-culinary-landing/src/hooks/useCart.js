import { useState, useEffect, useCallback } from 'react';
import { cartAPI } from '@/lib/api.js';
import { useAuth } from './useAuth.jsx';

export const useCart = () => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart();
      const cartData = response.data || { items: [], totalPrice: 0 };
      setCart(cartData);
      setTotalItems(cartData.items.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addToCart = useCallback(async (foodId, quantity = 1) => {
    if (!isAuthenticated) {
      // Handle guest cart or redirect to login
      return;
    }

    try {
      setIsLoading(true);
      await cartAPI.addToCart(foodId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchCart]);

  const updateQuantity = useCallback(async (foodId, quantity) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      if (quantity <= 0) {
        await cartAPI.removeItem(foodId);
      } else {
        await cartAPI.updateQuantity(foodId, quantity);
      }
      await fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchCart]);

  const removeItem = useCallback(async (foodId) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await cartAPI.removeItem(foodId);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      await cartAPI.clearCart();
      setCart({ items: [], totalPrice: 0 });
      setTotalItems(0);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const refreshCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch cart when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart({ items: [], totalPrice: 0 });
      setTotalItems(0);
    }
  }, [isAuthenticated, fetchCart]);

  return {
    cart,
    totalItems,
    totalPrice: cart.totalPrice,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    fetchCart
  };
};
