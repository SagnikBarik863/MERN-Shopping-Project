import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../services/api";
import CartItem from "../components/CartItem";

const Cart = () => {
  const { cartItems, loading, error, totalUnits, subtotal, refreshCart } = useCart();

  if (loading) return <p className="center-msg">Loading your cart...</p>;

  if (error) {
    return (
      <div className="center-msg">
        <p className="error-text">Unable to load your cart.</p>
        <button className="btn" onClick={refreshCart}>Try Again</button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="center-msg">
        <p className="big-icon">🛒</p>
        <h2>Your cart is empty</h2>
        <p className="muted">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>My Cart</h1>

      <div className="cart-layout">
        <div className="panel">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        <div className="panel summary">
          <h2>Order Summary</h2>
          <div className="row-between"><span>Items</span><span>{totalUnits}</span></div>
          <div className="row-between"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
          <Link to="/checkout" className="btn btn-block">Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
