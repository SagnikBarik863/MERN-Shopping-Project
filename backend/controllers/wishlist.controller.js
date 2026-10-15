import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import isValidId from "../utils/isValidId.js";

// The user always comes from the auth middleware (req.user), never from the request body.

// POST /wishlist/:productId
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const user = req.user;
  const alreadySaved = user.wishlist.some((id) => id.toString() === productId);

  if (alreadySaved) {
    return res.status(409).json({ success: false, message: "Product already in wishlist" });
  }

  user.wishlist.push(product._id);
  await user.save();

  res.status(201).json({ success: true, message: "Product added to wishlist" });
});

// GET /wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await Customer.findById(req.user._id).populate({
    path: "wishlist",
    select: "name price category image stock",
  });

  // If a product was deleted, populate returns null for it - filter those out
  const wishlist = user.wishlist.filter(Boolean);

  res.json({ success: true, count: wishlist.length, wishlist });
});

// DELETE /wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const user = req.user;
  const exists = user.wishlist.some((id) => id.toString() === productId);

  if (!exists) {
    return res.status(404).json({ success: false, message: "Product not in wishlist" });
  }

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  await user.save();

  res.json({ success: true, message: "Product removed from wishlist" });
});

// PATCH /wishlist/:productId/toggle  (bonus)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const user = req.user;
  const exists = user.wishlist.some((id) => id.toString() === productId);

  if (exists) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();
    return res.json({ success: true, saved: false, message: "Product removed from wishlist" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  user.wishlist.push(product._id);
  await user.save();

  res.json({ success: true, saved: true, message: "Product added to wishlist" });
});
