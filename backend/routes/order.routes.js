import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus); // bonus: dev endpoint

export default router;
