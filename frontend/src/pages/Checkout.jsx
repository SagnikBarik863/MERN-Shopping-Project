import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, getErrorMessage, verifyPayment } from "../services/api";
import OrderSummary from "../components/OrderSummary";

const FIELDS = [
  { name: "fullName", label: "Full Name" },
  { name: "phone", label: "Phone" },
  { name: "addressLine1", label: "Address" },
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "pincode", label: "Pincode" },
];

// Loads Razorpay's Checkout script once. Resolves false if it cannot be loaded.
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const validate = (form) => {
  const errors = {};
  FIELDS.forEach(({ name, label }) => {
    if (!form[name].trim()) errors[name] = `${label} is required.`; // also catches whitespace-only
  });
  if (!errors.phone && !/^\d{10}$/.test(form.phone.trim())) errors.phone = "Phone number must contain 10 digits.";
  if (!errors.pincode && !/^\d{6}$/.test(form.pincode.trim())) errors.pincode = "Pincode must contain 6 digits.";
  return errors;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, loading, subtotal, clearCart } = useCart();

  const [form, setForm] = useState({ fullName: "", phone: "", addressLine1: "", city: "", state: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Do not call the backend if basic validation fails
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPlacing(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setMessage("Could not load Razorpay. Check your internet connection and try again.");
      setPlacing(false);
      return;
    }

    try {
      // Only the shipping address is sent. The server calculates the total itself.
      const { data } = await createPaymentOrder(form);

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "ShopKart",
        description: "ShopKart Order",
        order_id: data.razorpayOrderId,

        // This does NOT mean the payment is valid - we send it to the backend to verify
        handler: async (response) => {
          try {
            const res = await verifyPayment({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart(); // backend cart is already empty -> update global state, Navbar shows Cart (0)
            navigate(`/order-success/${res.data.order._id}`);
          } catch (err) {
            setMessage(getErrorMessage(err, "Payment verification failed. Your cart has not been cleared."));
            setPlacing(false);
          }
        },

        prefill: { name: form.fullName, contact: form.phone },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => {
            setMessage("Payment was cancelled. Your cart has not been cleared.");
            setPlacing(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", (response) => {
        console.error("Payment failed", response.error);
        setMessage("Payment failed. Your cart has not been cleared. Please try again.");
        setPlacing(false);
      });

      paymentObject.open();
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not place order. Please try again."));
      setPlacing(false);
    }
  };

  if (loading) return <p className="center-msg">Loading your cart...</p>;

  // Opening /checkout directly with an empty cart
  if (cartItems.length === 0) {
    return (
      <div className="center-msg">
        <h2>Your cart is empty</h2>
        <p className="muted">Add some products before checking out.</p>
        <Link to="/products" className="btn">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Checkout</h1>

      {message && <p className="alert alert-error">{message}</p>}

      <div className="cart-layout">
        <form className="panel" onSubmit={handleSubmit} noValidate>
          <h2>Shipping Details</h2>
          {FIELDS.map(({ name, label }) => (
            <div key={name}>
              <label>{label}</label>
              <input name={name} value={form[name]} onChange={handleChange} disabled={placing} />
              {errors[name] && <p className="error-text">{errors[name]}</p>}
            </div>
          ))}

          <button className="btn btn-block" disabled={placing}>
            {placing ? "Processing payment..." : "Place Order & Pay"}
          </button>
          <p className="muted small">Razorpay Test Mode — no real money is charged.</p>
        </form>

        <OrderSummary items={cartItems} subtotal={subtotal} />
      </div>
    </div>
  );
};

export default Checkout;
