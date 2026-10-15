import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import isValidId from "../utils/isValidId.js";

// Escape special regex characters so a search like "c++" does not break the query
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /products
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, image, stock } = req.body;

  const missing = [name, description, category, image].some((v) => typeof v !== "string" || v.trim() === "");
  if (missing || price === undefined || stock === undefined) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ success: false, message: "Price must be a number greater than 0" });
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ success: false, message: "Stock must be a whole number (minimum 0)" });
  }

  const product = await Product.create({ name, description, price, category, image, stock });

  res.status(201).json({ success: true, product });
});

// GET /products?search=&category=&sort=price_asc|price_desc
export const getProducts = asyncHandler(async (req, res) => {
  const { search, category, sort } = req.query;

  // Build the MongoDB query dynamically from whichever filters were sent
  const query = {};

  if (search && search.trim()) {
    query.name = { $regex: escapeRegex(search.trim()), $options: "i" }; // case-insensitive
  }

  if (category && category.trim()) {
    query.category = category.trim();
  }

  let sortBy = { createdAt: -1 };
  if (sort === "price_asc") sortBy = { price: 1 };
  if (sort === "price_desc") sortBy = { price: -1 };

  const products = await Product.find(query)
    .select("name price category image stock")
    .sort(sortBy);

  res.json({ success: true, count: products.length, products });
});

// GET /products/categories  (helper for the category dropdown)
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category");
  res.json({ success: true, categories: categories.sort() });
});

// GET /products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  res.json({ success: true, product });
});
