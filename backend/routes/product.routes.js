import express from "express";
import { createProduct, getProducts, getCategories, getProductById } from "../controllers/product.controller.js";

const router = express.Router();

// Product creation is an open API for now (as allowed in Lab 03)
router.post("/", createProduct);
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

export default router;
