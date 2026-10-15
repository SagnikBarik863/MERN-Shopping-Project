import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, getErrorMessage, getOrder, imageUrl, updateOrderStatus } from "../services/api";
import OrderStatus from "../components/OrderStatus";

const NEXT_STATUS = { PLACED: "CONFIRMED", CONFIRMED: "SHIPPED", SHIPPED: "DELIVERED" };

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then((res) => setOrder(res.data.order))
      .catch((err) => setError(getErrorMessage(err, "Could not load order.")));
  }, [id]);

  // Bonus: development-only button to move the order to the next status
  const handleAdvance = async () => {
    setUpdating(true);
    try {
      const res = await updateOrderStatus(order._id, NEXT_STATUS[order.status]);
      setOrder(res.data.order);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update status"));
    } finally {
      setUpdating(false);
    }
  };

  if (error) {
    return (
      <div className="center-msg">
        <p className="error-text">{error}</p>
        <Link to="/orders" className="btn">Back to Orders</Link>
      </div>
    );
  }
  if (!order) return <p className="center-msg">Loading order...</p>;

  const address = order.shippingAddress;
  const nextStatus = order.paymentStatus === "PAID" ? NEXT_STATUS[order.status] : null;

  return (
    <div>
      <Link to="/orders" className="back-link">← Back to Orders</Link>
      <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="muted">Placed on {new Date(order.createdAt).toLocaleString("en-IN")}</p>

      <div className="cart-layout">
        <div className="panel">
          <h2>Items</h2>
          {/* Names and prices are the snapshot saved at purchase time */}
          {order.items.map((item) => (
            <div key={item.product} className="order-item">
              <img src={imageUrl(item.image)} alt={item.name} />
              <div className="grow">
                <p><strong>{item.name}</strong></p>
                <p className="muted">{formatPrice(item.price)} × {item.quantity}</p>
              </div>
              <p>{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          <hr />
          <div className="row-between"><strong>Total</strong><strong>{formatPrice(order.totalAmount)}</strong></div>
        </div>

        <div className="panel">
          <h2>Status</h2>
          <OrderStatus order={order} />
          {order.razorpayPaymentId && <p className="muted small">Payment ID: {order.razorpayPaymentId}</p>}

          {nextStatus && (
            <button className="btn btn-outline" onClick={handleAdvance} disabled={updating}>
              {updating ? "Updating..." : `Mark as ${nextStatus} (dev)`}
            </button>
          )}

          <h2>Shipping Address</h2>
          <p>
            {address.fullName}<br />
            {address.addressLine1}<br />
            {address.city}, {address.state} - {address.pincode}<br />
            Phone: {address.phone}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
