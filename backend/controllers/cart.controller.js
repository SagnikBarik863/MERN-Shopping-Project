import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import isValidId from "../utils/isValidId.js";

// Loads the user's cart with the LATEST product data (price, stock) populated.
// Subtotal / counts are NOT stored - the frontend derives them from this.
const loadCart = async (userId) => {
  const user = await Customer.findById(userId).populate({
    path: "cart.product",
    select: "name price category image stock",
  });

  // Skip items whose product was deleted
  return user.cart.filter((item) => item.product);
};

// POST /cart/:productId  - add 1, or increase quantity by 1 if already in cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const user = req.user;
  const item = user.cart.find((i) => i.product.toString() === productId);
  const newQuantity = item ? item.quantity + 1 : 1;

  if (newQuantity > product.stock) {
    return res.status(400).json({
      success: false,
      message: product.stock === 0 ? `${product.name} is out of stock` : `Only ${product.stock} units of ${product.name} available`,
    });
  }

  if (item) {
    item.quantity = newQuantity;
  } else {
    user.cart.push({ product: product._id, quantity: 1 });
  }

  await user.save();

  res.json({ success: true, message: "Cart updated", cart: await loadCart(user._id) });
});

// GET /cart
export const getCart = asyncHandler(async (req, res) => {
  res.json({ success: true, cart: await loadCart(req.user._id) });
});

// PATCH /cart/:productId   body: { quantity }
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
    return res.status(400).json({ success: false, message: "Quantity must be a whole number" });
  }

  if (quantity < 1) {
    return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const user = req.user;
  const item = user.cart.find((i) => i.product.toString() === productId);

  if (!item) {
    return res.status(404).json({ success: false, message: "Product not in cart" });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ success: false, message: `Only ${product.stock} units of ${product.name} available` });
  }

  item.quantity = quantity;
  await user.save();

  res.json({ success: true, message: "Cart updated", cart: await loadCart(user._id) });
});

// DELETE /cart/:productId
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const user = req.user;
  const exists = user.cart.some((i) => i.product.toString() === productId);

  if (!exists) {
    return res.status(404).json({ success: false, message: "Product not in cart" });
  }

  user.cart = user.cart.filter((i) => i.product.toString() !== productId);
  await user.save();

  res.json({ success: true, message: "Product removed from cart", cart: await loadCart(user._id) });
});
