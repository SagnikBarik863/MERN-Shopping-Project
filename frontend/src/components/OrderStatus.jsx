const STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

// Shows payment status, and for paid orders a simple status progress bar (Lab 06 bonus)
const OrderStatus = ({ order }) => {
  if (order.paymentStatus !== "PAID") {
    return (
      <p>
        Payment: <span className={`badge ${order.paymentStatus === "FAILED" ? "badge-red" : "badge-yellow"}`}>{order.paymentStatus}</span>
        {" "}Status: <span className="badge badge-yellow">{order.status}</span>
      </p>
    );
  }

  const current = STEPS.indexOf(order.status);

  return (
    <div>
      <p>Payment: <span className="badge badge-green">PAID</span></p>
      <div className="steps">
        {STEPS.map((step, i) => (
          <span key={step} className={`step ${i <= current ? "done" : ""}`}>{step}</span>
        ))}
      </div>
    </div>
  );
};

export default OrderStatus;
