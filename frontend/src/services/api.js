import axios from "axios";

// All API calls live here so UI components stay clean.
// withCredentials: true makes the browser send the HttpOnly auth cookie with every request.
// In production the frontend proxies /api/* to the backend (see vercel.json), keeping the cookie same-origin
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Helper to get a readable error message from any failed request
export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || fallback;

// ---------- Customers (Lab 01 / 02) ----------
export const registerCustomer = (data) => api.post("/customers/register", data);
export const loginCustomer = (data) => api.post("/customers/login", data);
export const getMe = () => api.get("/customers/me");
export const logoutCustomer = () => api.post("/customers/logout");
export const changePassword = (data) => api.patch("/customers/change-password", data);

// ---------- Products (Lab 03) ----------
export const getProducts = (params) => api.get("/products", { params });
export const getCategories = () => api.get("/products/categories");
export const getProduct = (id) => api.get(`/products/${id}`);

// ---------- Wishlist (Lab 04) ----------
export const getWishlist = () => api.get("/wishlist");
export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);
export const toggleWishlist = (productId) => api.patch(`/wishlist/${productId}/toggle`);

// The Navbar listens for this event to refresh its wishlist count from the backend
export const notifyWishlistChanged = () => window.dispatchEvent(new Event("wishlist-changed"));

// ---------- Cart (Lab 05) ----------
export const getCart = () => api.get("/cart");
export const addToCart = (productId) => api.post(`/cart/${productId}`);
export const updateCartItem = (productId, quantity) => api.patch(`/cart/${productId}`, { quantity });
export const removeCartItem = (productId) => api.delete(`/cart/${productId}`);

// ---------- Orders + Payment (Lab 06) ----------
export const createPaymentOrder = (shippingAddress) => api.post("/orders/create-payment-order", { shippingAddress });
export const verifyPayment = (data) => api.post("/orders/verify-payment", data);
export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });

// ---------- Helpers ----------
// Seeded products store images as "/images/x.webp" (served by the backend); full URLs are used as-is
export const imageUrl = (src) => (src && src.startsWith("/") ? API_URL + src : src);

export const formatPrice = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

export default api;
