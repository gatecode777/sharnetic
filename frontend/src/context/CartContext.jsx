import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCartItems([]);
      setCartCount(0);
      setCartSubtotal(0);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.data.success) {
        const { items, itemCount, subtotal } = response.data.cart;
        setCartItems(items);
        setCartCount(itemCount);
        setCartSubtotal(subtotal);
      }
    } catch (error) {
      console.error('fetchCart error:', error);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isLoggedIn) {
      showToast('Please login to add items to cart', 'warning', 3000);
      return { success: false, requiresLogin: true };
    }
    
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      if (response.data.success) {
        await fetchCart();
        showToast(response.data.message || 'Item added to cart successfully!', 'success', 3000);
        return { success: true, message: response.data.message };
      }
      showToast(response.data.message || 'Failed to add to cart', 'error', 3000);
      return { success: false, message: response.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add to cart';
      showToast(errorMsg, 'error', 3000);
      return { success: false, message: errorMsg };
    }
  }, [isLoggedIn, fetchCart, showToast]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const response = await cartAPI.updateQuantity(productId, quantity);
      if (response.data.success) {
        await fetchCart();
        showToast('Cart updated successfully', 'success', 2000);
      }
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Update failed';
      showToast(errorMsg, 'error', 3000);
      return { success: false, message: errorMsg };
    }
  }, [fetchCart, showToast]);

  const removeItem = useCallback(async (productId) => {
    try {
      const response = await cartAPI.removeItem(productId);
      if (response.data.success) {
        await fetchCart();
        showToast('Item removed from cart', 'success', 2000);
      }
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove item';
      showToast(errorMsg, 'error', 3000);
      return { success: false, message: errorMsg };
    }
  }, [fetchCart, showToast]);

  const clearCart = useCallback(async () => {
    try {
      const response = await cartAPI.clearCart();
      if (response.data.success) {
        setCartItems([]);
        setCartCount(0);
        setCartSubtotal(0);
        showToast('Cart cleared successfully', 'info', 2000);
      }
      return response.data;
    } catch (error) {
      showToast('Failed to clear cart', 'error', 3000);
      return { success: false };
    }
  }, [showToast]);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartSubtotal,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;