// Inserts sample products into MongoDB.  Run with:  npm run seed
import "dotenv/config";
import mongoose from "mongoose";
import Product from "./models/product.model.js";

// Images live in backend/public/images and are served by Express at /images/...
// (Product photos from dummyjson.com, book covers from openlibrary.org)
const img = (file) => `/images/${file}`;

const products = [
  // Electronics
  { name: "Wireless Over-Ear Headphones", description: "Over-ear headphones with active noise cancellation, 20-hour battery and a soft knit headband.", price: 4999, category: "Electronics", image: img("headphones.webp"), stock: 25 },
  { name: "Wireless Neckband Earphones", description: "Lightweight Bluetooth earphones with magnetic earbuds and 12-hour playback.", price: 1499, category: "Electronics", image: img("earphones.webp"), stock: 40 },
  { name: "Smart Speaker", description: "Voice-controlled smart speaker with 360° sound and a built-in home hub.", price: 2499, category: "Electronics", image: img("smart-speaker.webp"), stock: 0 },
  { name: "Android Smartphone 128 GB", description: "6.1-inch AMOLED display, triple rear camera and all-day battery.", price: 18999, category: "Electronics", image: img("smartphone.webp"), stock: 10 },
  { name: "13-inch Ultrabook Laptop", description: "Thin and light laptop with 16 GB RAM, 512 GB SSD and a 13.4-inch display.", price: 64999, category: "Electronics", image: img("laptop.webp"), stock: 3 },
  { name: "10-inch Android Tablet", description: "10.4-inch display, 64 GB storage and stereo speakers for movies and study.", price: 15999, category: "Electronics", image: img("tablet.webp"), stock: 8 },
  { name: "Wireless Charging Pad", description: "Fast Qi wireless charger for phones and earbuds with a non-slip surface.", price: 1299, category: "Electronics", image: img("charger.webp"), stock: 30 },

  // Fashion
  { name: "Men's Plaid Shirt", description: "Regular-fit cotton flannel shirt with a classic checked pattern.", price: 1199, category: "Fashion", image: img("plaid-shirt.webp"), stock: 30 },
  { name: "Running Sneakers", description: "Lightweight sneakers with a cushioned sole and breathable upper.", price: 3299, category: "Fashion", image: img("sneakers.webp"), stock: 18 },
  { name: "Classic Black Sunglasses", description: "UV400-protected sunglasses with a lightweight black frame.", price: 799, category: "Fashion", image: img("sunglasses.webp"), stock: 50 },
  { name: "Leather Strap Watch", description: "Analog wristwatch with a brown genuine-leather strap.", price: 2499, category: "Fashion", image: img("watch.webp"), stock: 12 },
  { name: "Black Leather Handbag", description: "Structured handbag with a zip compartment and detachable strap.", price: 2199, category: "Fashion", image: img("handbag.webp"), stock: 4 },

  // Books
  { name: "Clean Code", description: "A handbook of agile software craftsmanship by Robert C. Martin.", price: 699, category: "Books", image: img("clean-code.jpg"), stock: 30 },
  { name: "The Pragmatic Programmer", description: "Your journey to mastery, 20th anniversary edition, by David Thomas and Andrew Hunt.", price: 849, category: "Books", image: img("pragmatic-programmer.jpg"), stock: 15 },
  { name: "JavaScript: The Good Parts", description: "Douglas Crockford's guide to the best features of JavaScript.", price: 450, category: "Books", image: img("js-good-parts.jpg"), stock: 8 },
  { name: "Eloquent JavaScript", description: "A modern introduction to programming by Marijn Haverbeke, 3rd edition.", price: 599, category: "Books", image: img("eloquent-js.jpg"), stock: 20 },

  // Home
  { name: "Table Lamp", description: "Bedside table lamp with a fabric shade and a warm white bulb.", price: 1199, category: "Home", image: img("table-lamp.webp"), stock: 20 },
  { name: "Ceramic Plant Pot", description: "Matte ceramic planter with a drainage hole, suits small indoor plants.", price: 499, category: "Home", image: img("plant-pot.webp"), stock: 35 },
  { name: "Insulated Coffee Mug", description: "Double-walled 350 ml mug that keeps drinks hot for hours.", price: 349, category: "Home", image: img("coffee-mug.webp"), stock: 50 },
  { name: "Hand Blender", description: "300 W stainless-steel hand blender for soups, shakes and purees.", price: 1899, category: "Home", image: img("hand-blender.webp"), stock: 15 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
