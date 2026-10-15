import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, getErrorMessage, getOrder } from "../services/api";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data.order))
      .catch((err) => setError(getErrorMessage(err, "Could not load order.")));
  }, [id]);

  if (error) return <p className="center-msg error-text">{error}</p>;
  if (!order) return <p className="center-msg">Loading order...</p>;

  return (
    <div className="panel success-box">
      <p className="big-icon">✅</p>
      <h1>Order Placed Successfully</h1>

      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Total:</strong> {formatPrice(order.totalAmount)}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Payment:</strong> {order.paymentStatus}</p>

      <p className="muted">Your order has been saved successfully.</p>

      <div className="card-actions center-actions">
        <Link to="/orders" className="btn">View My Orders</Link>
        <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
