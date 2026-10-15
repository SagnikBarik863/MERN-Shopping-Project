import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

// Only these fields are ever sent to the client (never the password)
const toPublic = (customer) => ({
  _id: customer._id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
  createdAt: customer.createdAt,
});

const isBlank = (value) => typeof value !== "string" || value.trim() === "";

// POST /customers/register
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if ([fullName, email, password, phone].some(isBlank)) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must contain at least 6 characters" });
  }

  const existing = await Customer.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const customer = await Customer.create({
    fullName,
    email,
    password: hashedPassword,
    phone,
  });

  res.status(201).json({
    success: true,
    message: "Customer registered successfully",
    customer: toPublic(customer),
  });
});

// POST /customers/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (isBlank(email) || isBlank(password)) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // password has select:false, so it must be requested explicitly
  const customer = await Customer.findOne({ email: email.toLowerCase().trim() }).select("+password");

  // Same message for wrong email and wrong password
  if (!customer || !(await bcrypt.compare(password, customer.password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  generateToken(res, customer._id);

  res.json({
    success: true,
    message: "Login successful",
    customer: toPublic(customer),
  });
});

// GET /customers/me  (protected)
export const getMe = asyncHandler(async (req, res) => {
  res.json(toPublic(req.user));
});

// POST /customers/logout  (protected)
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.json({ success: true, message: "Logged out successfully" });
});

// PATCH /customers/change-password  (protected, bonus)
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (isBlank(oldPassword) || isBlank(newPassword)) {
    return res.status(400).json({ success: false, message: "Old and new password are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must contain at least 6 characters" });
  }

  const customer = await Customer.findById(req.user._id).select("+password");

  const matches = await bcrypt.compare(oldPassword, customer.password);
  if (!matches) {
    return res.status(401).json({ success: false, message: "Old password is incorrect" });
  }

  customer.password = await bcrypt.hash(newPassword, 10);
  await customer.save();

  res.json({ success: true, message: "Password changed successfully" });
});
