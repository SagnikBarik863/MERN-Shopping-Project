import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "../services/api";

// One shared source of truth for the cart (Lab 05).
// Navbar, ProductCard, Cart page and Checkout all read from here.
const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getCart();
      setCartItems(res.data.cart);
    } catch (err) {
      setError(api.getErrorMessage(err, "Unable to load your cart."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Every mutation returns the updated cart from the backend, which replaces our state.
  // Errors are thrown so the calling component can show a message.
  const addToCart = async (productId) => {
    const res = await api.addToCart(productId);
    setCartItems(res.data.cart);
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.updateCartItem(productId, quantity);
    setCartItems(res.data.cart);
  };

  const removeFromCart = async (productId) => {
    const res = await api.removeCartItem(productId);
    setCartItems(res.data.cart);
  };

  // Called after payment is verified (backend has already cleared the cart)
  const clearCart = () => setCartItems([]);

  // Derived values - calculated, never stored
  const totalUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const value = {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
