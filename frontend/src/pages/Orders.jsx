import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/api";
import OrderCard from "../components/OrderCard";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = () => {
    setLoading(true);
    setError("");
    getOrders()
      .then((res) => setOrders(res.data.orders))
      .catch(() => setError("Unable to load your orders."))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrders, []);

  if (loading) return <p className="center-msg">Loading your orders...</p>;

  if (error) {
    return (
      <div className="center-msg">
        <p className="error-text">{error}</p>
        <button className="btn" onClick={loadOrders}>Try Again</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="center-msg">
        <p className="big-icon">📦</p>
        <h2>You have not placed any orders yet.</h2>
        <Link to="/products" className="btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default Orders;
