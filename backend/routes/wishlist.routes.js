import express from "express";
import { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist } from "../controllers/wishlist.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

// Every wishlist route is protected
router.use(protect);

router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.patch("/:productId/toggle", toggleWishlist);

export default router;
