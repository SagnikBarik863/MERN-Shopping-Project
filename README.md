# ShopKart — MERN E-Commerce App

ShopKart is a simple full-stack e-commerce app built with **MongoDB, Express, React and Node.js**. It covers all six ShopKart lab problem statements:

| Lab | Feature | What is included |
|---|---|---|
| 01 | Customer Authentication (backend) | Register, login, JWT in an **HttpOnly cookie**, protected `/customers/me`, logout, bcrypt hashing, *bonus:* change password |
| 02 | Login → Home flow (frontend) | Register / Login / protected Home pages, logout, redirect to `/login` when not logged in |
| 03 | Product Catalogue | Product model and APIs, search, category filter, product details page, loading / error / empty states, *bonus:* sort by price |
| 04 | Wishlist | Wishlist stored as Product ObjectIds, `populate()`, add / get / remove APIs, wishlist page, *bonus:* toggle + navbar count |
| 05 | Shopping Cart | Cart (product ref + quantity), stock checks, **Context API** global cart state, quantity controls, derived subtotal, navbar count |
| 06 | Checkout & Orders | Shipping form with validation, server-side stock and total check, order snapshot, **Razorpay Test Mode** payment, HMAC signature check, order success page, order history, *bonus:* order status progression |

---

## 1. Requirements

- **Node.js 18 or newer** (tested on Node 22)
- **MongoDB**, either:
  - local: install [MongoDB Community Server](https://www.mongodb.com/try/download/community) (it runs on `mongodb://127.0.0.1:27017`), **or**
  - cloud: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (copy its connection string)
- A free **Razorpay** account in **Test Mode**. You only need this for the payment step.

---

## 2. Project Structure

```text
VIVA PROJECT/
├── backend/
│   ├── config/         db.js, razorpay.js
│   ├── controllers/    customer, product, wishlist, cart, order
│   ├── middlewares/    auth.middleware.js (JWT from cookie), error.middleware.js
│   ├── models/         customer.model.js, product.model.js, order.model.js
│   ├── routes/         customer, product, wishlist, cart, order
│   ├── utils/          generateToken.js, asyncHandler.js, isValidId.js
│   ├── public/images/  product photos (served at /images/...)
│   ├── seed.js         inserts 20 sample products
│   ├── index.js        Express server
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/      Login, Register, Home, Products, ProductDetails, Wishlist,
        │               Cart, Checkout, OrderSuccess, Orders, OrderDetails
        ├── components/ Navbar, ProtectedRoute, ProductCard, SearchBar, WishlistCard,
        │               WishlistButton, AddToCartButton, CartItem, OrderCard, ...
        ├── context/    CartContext.jsx (global cart state)
        ├── services/   api.js (every API call, axios with withCredentials)
        ├── App.jsx     routes
        └── main.jsx
```

---

## 3. Setup and Run

### Step 1 — Backend

```bash
cd backend
npm install
```

Create a file named `backend/.env`. You can copy it from `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopkart
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_key_secret
```

| Variable | Meaning |
|---|---|
| `PORT` | Port for the API server (default 5000) |
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret used to sign JWTs. Use any long random string. |
| `JWT_EXPIRES_IN` | How long a login lasts (e.g. `7d`) |
| `CLIENT_URL` | URL of the React app, used for CORS with cookies |
| `NODE_ENV` | `development` locally. In `production` the cookie is marked `secure` (needs HTTPS). |
| `RAZORPAY_KEY_ID` | Razorpay **Test** Key ID (starts with `rzp_test_`) |
| `RAZORPAY_KEY_SECRET` | Razorpay **Test** Key Secret. Backend only, never commit it. |

Insert the sample products, then start the server:

```bash
npm run seed      # adds 20 products with images
npm run dev       # starts with nodemon  (or: npm start)
```

You should see `MongoDB connected` and `ShopKart server running on http://localhost:5000`.

### Step 2 — Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

The frontend calls `http://localhost:5000` by default. To point it at a different backend, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

### Step 3 — Razorpay test keys (for checkout)

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/) and switch to **Test Mode**.
2. Go to **Account & Settings → API Keys → Generate Test Key**.
3. Put the Key ID and Key Secret into `backend/.env` and **restart the backend**.

To pay in Test Mode, use any test method shown in the Razorpay checkout popup. For example, choose **UPI** and enter `success@razorpay` for a successful payment or `failure@razorpay` for a failed one, or use one of the test cards listed in [Razorpay's test card docs](https://razorpay.com/docs/payments/payments/test-card-details/). No real money is charged.

> Without valid keys, everything else in the app still works. Only "Place Order & Pay" shows *"Could not start payment"*.

---

## 4. How to Use the App

1. **Register** at `/register`, then **log in** at `/login`.
2. **Home** (`/home`) shows your profile and lets you change your password.
3. **Products** (`/products`) lets you search, filter by category and sort by price. Each card can **♡ Add to Wishlist** and **Add to Cart**.
4. **Wishlist** (`/wishlist`) shows saved products, with View Details and Remove buttons.
5. **Cart** (`/cart`) has −/+ quantity controls (limited by stock), Remove, subtotal, and **Proceed to Checkout**.
6. **Checkout** (`/checkout`): enter the shipping details, then **Place Order & Pay** opens the Razorpay test popup.
7. After a verified payment you land on **Order Placed Successfully**. The cart is cleared and the navbar shows `Cart (0)`.
8. **Orders** (`/orders`) shows your order history, newest first. **View Details** shows the items, address and status. A dev-only button moves the status PLACED → CONFIRMED → SHIPPED → DELIVERED.

---

## 5. API Reference

All protected routes read the JWT from the `token` HttpOnly cookie. For easier Postman testing they also accept an `Authorization: Bearer <token>` header. In Postman, the cookie is saved automatically after you log in.

### Customers (Lab 01)
| Method | Endpoint | Auth | Notes |
|---|---|:-:|---|
| POST | `/customers/register` | | `{ fullName, email, password, phone }` → 201 / 400 / 409 |
| POST | `/customers/login` | | `{ email, password }` → sets cookie / 401 "Invalid credentials" |
| GET | `/customers/me` | ✅ | current customer (no password) |
| POST | `/customers/logout` | ✅ | clears cookie |
| PATCH | `/customers/change-password` | ✅ | `{ oldPassword, newPassword }` (bonus) |

### Products (Lab 03)
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/products` | `{ name, description, price, category, image, stock }` → 201 / 400 |
| GET | `/products` | query: `search`, `category`, `sort=price_asc\|price_desc` |
| GET | `/products/categories` | list of categories for the dropdown |
| GET | `/products/:id` | 400 invalid id / 404 not found |

### Wishlist (Lab 04), all protected
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/wishlist/:productId` | 201 / 400 / 404 / 409 duplicate |
| GET | `/wishlist` | populated products + `count` |
| DELETE | `/wishlist/:productId` | 404 if not in wishlist |
| PATCH | `/wishlist/:productId/toggle` | returns `{ saved: true/false }` (bonus) |

### Cart (Lab 05), all protected
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/cart/:productId` | adds 1, or +1 if already in cart; 400 if over stock |
| GET | `/cart` | items with populated product + quantity |
| PATCH | `/cart/:productId` | `{ quantity }`, must be ≥ 1 and ≤ stock |
| DELETE | `/cart/:productId` | returns updated cart |

### Orders and Payment (Lab 06), all protected
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/orders/create-payment-order` | `{ shippingAddress }`. Validates cart, stock and address, calculates the total on the server, creates a PENDING order and a Razorpay order (in paise) |
| POST | `/orders/verify-payment` | `{ shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }`. Checks the HMAC-SHA256 signature, then marks the order PAID/PLACED, reduces stock and clears the cart |
| GET | `/orders` | current user's orders, newest first |
| GET | `/orders/:id` | 404 if the order is missing or belongs to someone else |
| PATCH | `/orders/:id/status` | `{ status }`. Dev endpoint for the bonus status progression |

---

## 6. Security and Business Rules Implemented

- Passwords are stored only as **bcrypt hashes** and are never returned (`select: false`).
- The JWT lives in an **HttpOnly** cookie, so page JavaScript cannot read it. The frontend sends it with `withCredentials: true`.
- Login gives the same "Invalid credentials" message for a wrong email and a wrong password.
- The user is always taken from the JWT (`req.user`). No API accepts a `userId` from the client.
- Wishlist and cart store **references** to products, so the latest price and stock are always shown. Subtotal and counts are calculated, not stored.
- Orders store a **snapshot** (name, price, image, quantity), so old orders keep their original price.
- At checkout the server **re-checks stock**, rejects deleted products and empty carts, and **calculates the total itself**. Any `totalAmount` sent by the client is ignored.
- `RAZORPAY_KEY_SECRET` stays on the server. Only the Key ID is sent to React.
- An order becomes **PAID** only after the Razorpay signature is verified on the server, using the Razorpay order id **stored in the database**.
- The cart is cleared **only after** payment is verified. If payment fails or is cancelled, the cart is kept.
- Users can read only their own orders. Another user's order returns 404.

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| `MongoDB connection failed` | Make sure MongoDB is running, or check the Atlas URI. In Atlas, add your IP under *Network Access*. |
| Logged in but immediately sent back to `/login` | The frontend must run on the URL set in `CLIENT_URL` (default `http://localhost:5173`). Use `localhost` in both places, not `127.0.0.1` in one and `localhost` in the other. |
| "Could not start payment" | Add valid Razorpay **test** keys to `backend/.env` and restart the backend. |
| Razorpay popup does not open | The browser needs internet access to load `checkout.razorpay.com`. |
| Old cart items vanish after `npm run seed` | Seeding replaces all products with new IDs, so old cart and wishlist references no longer match. |
