import { Link } from "react-router-dom";
import { formatPrice } from "../services/api";
import OrderStatus from "./OrderStatus";

const OrderCard = ({ order }) => {
  return (
    <div className="panel order-card">
      <div className="row-between">
        <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
        <span className="muted">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>

      <ul className="plain-list">
        {order.items.map((item) => (
          <li key={item.product}>{item.name} × {item.quantity}</li>
        ))}
      </ul>

      <p><strong>Total: {formatPrice(order.totalAmount)}</strong></p>
      <OrderStatus order={order} />

      <Link to={`/orders/${order._id}`} className="btn btn-outline">View Details</Link>
    </div>
  );
};

export default OrderCard;
