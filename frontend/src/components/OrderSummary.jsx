import { formatPrice } from "../services/api";

// Used on the Checkout page. Prices shown here are only for display -
// the backend recalculates the real total from the database.
const OrderSummary = ({ items, subtotal }) => {
  return (
    <div className="panel">
      <h2>Order Summary</h2>
      {items.map((item) => (
        <div key={item.product._id} className="row-between summary-row">
          <span>{item.product.name} × {item.quantity}</span>
          <span>{formatPrice(item.product.price * item.quantity)}</span>
        </div>
      ))}
      <hr />
      <div className="row-between">
        <strong>Total</strong>
        <strong>{formatPrice(subtotal)}</strong>
      </div>
    </div>
  );
};

export default OrderSummary;
