import crypto from "crypto";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import getRazorpay from "../config/razorpay.js";
import asyncHandler from "../utils/asyncHandler.js";
import isValidId from "../utils/isValidId.js";

// Server-side validation of the shipping address
const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object") return "Shipping address is required";

  const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const field of fields) {
    if (typeof address[field] !== "string" || address[field].trim() === "") {
      return `${field} is required`;
    }
  }

  if (!/^\d{10}$/.test(address.phone.trim())) return "Phone number must contain 10 digits";
  if (!/^\d{6}$/.test(address.pincode.trim())) return "Pincode must contain 6 digits";

  return null;
};

// POST /orders/create-payment-order
// Body: { shippingAddress }. Anything else (like totalAmount) is ignored.
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  const addressError = validateShippingAddress(shippingAddress);
  if (addressError) {
    return res.status(400).json({ success: false, message: addressError });
  }

  const user = req.user;

  // 1. Cart must not be empty
  if (user.cart.length === 0) {
    return res.status(400).json({ success: false, message: "Your cart is empty" });
  }

  // 2. Load the LATEST product data, verify existence + stock, build snapshot and total
  const items = [];
  let totalAmount = 0;

  for (const cartItem of user.cart) {
    const product = await Product.findById(cartItem.product);

    if (!product) {
      return res.status(400).json({ success: false, message: "A product in your cart is no longer available. Please remove it." });
    }

    if (cartItem.quantity > product.stock) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
    }

    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      image: product.image,
    });

    totalAmount += product.price * cartItem.quantity;
  }

  // Check Razorpay is configured before creating anything
  const razorpay = getRazorpay();

  // 3. Create the pending ShopKart order (cart is NOT cleared here)
  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress: {
      fullName: shippingAddress.fullName.trim(),
      phone: shippingAddress.phone.trim(),
      addressLine1: shippingAddress.addressLine1.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      pincode: shippingAddress.pincode.trim(),
    },
    totalAmount,
  });

  // 4. Create the Razorpay order (amount in paise)
  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Only the public Key ID is sent. The Key Secret never leaves the server.
    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    order.paymentStatus = "FAILED";
    await order.save();
    console.error("Razorpay order creation failed:", error?.error || error);
    res.status(502).json({ success: false, message: "Could not start payment. Please check Razorpay keys and try again." });
  }
});

// POST /orders/verify-payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const { shopKartOrderId, razorpay_payment_id, razorpay_signature } = req.body;

  if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment details" });
  }

  if (!isValidId(shopKartOrderId)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  // The order must belong to the logged-in user
  const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.paymentStatus === "PAID") {
    return res.json({ success: true, message: "Payment already verified", order });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ success: false, message: "Razorpay is not configured on the server" });
  }

  // Use the Razorpay order id stored in OUR database, not the one from the browser
  const body = order.razorpayOrderId + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    // Order is NOT marked paid and the cart is NOT cleared
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }

  // Signature is valid -> mark the order as paid and placed
  order.paymentStatus = "PAID";
  order.status = "PLACED";
  order.razorpayPaymentId = razorpay_payment_id;
  await order.save();

  // Reduce stock for the purchased items
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
  }

  // Clear the cart only now, after verified payment
  req.user.cart = [];
  await req.user.save();

  res.json({ success: true, message: "Payment verified successfully", order });
});

// GET /orders  - only the logged-in user's orders, newest first
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// GET /orders/:id  - must exist AND belong to the logged-in user
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  const order = await Order.findById(id);

  // 404 for both "missing" and "not yours" so order IDs cannot be probed
  if (!order || order.user.toString() !== req.user._id.toString()) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({ success: true, order });
});

// PATCH /orders/:id/status  (bonus - development endpoint to move a paid order forward)
const STATUS_FLOW = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ success: false, message: "Invalid order ID" });
  }

  if (!STATUS_FLOW.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${STATUS_FLOW.join(", ")}` });
  }

  const order = await Order.findOne({ _id: id, user: req.user._id });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  if (order.paymentStatus !== "PAID") {
    return res.status(400).json({ success: false, message: "Only paid orders can change status" });
  }

  order.status = status;
  await order.save();

  res.json({ success: true, message: "Order status updated", order });
});
