import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice, getErrorMessage, imageUrl } from "../services/api";

// Each cart row keeps its OWN loading state, so only this row is disabled while updating
const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { product, quantity } = item;

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update cart"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cart-item">
      <img src={imageUrl(product.image)} alt={product.name} />

      <div className="cart-item-info">
        <Link to={`/products/${product._id}`}><h3>{product.name}</h3></Link>
        <p className="muted">{formatPrice(product.price)} each · {product.stock} in stock</p>

        <div className="qty">
          <button onClick={() => run(() => updateQuantity(product._id, quantity - 1))} disabled={busy || quantity <= 1}>−</button>
          <span>{quantity}</span>
          <button onClick={() => run(() => updateQuantity(product._id, quantity + 1))} disabled={busy || quantity >= product.stock}>+</button>
        </div>

        <button className="link-btn" onClick={() => run(() => removeFromCart(product._id))} disabled={busy}>
          Remove
        </button>
        {error && <p className="error-text">{error}</p>}
      </div>

      <p className="cart-item-total">{formatPrice(product.price * quantity)}</p>
    </div>
  );
};

export default CartItem;
