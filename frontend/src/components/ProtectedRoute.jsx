import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getMe } from "../services/api";
import { CartProvider } from "../context/CartContext";
import Navbar from "./Navbar";

// Asks the backend who is logged in (the cookie is HttpOnly, so React cannot read it).
// If /customers/me fails, the user is sent to /login.
const ProtectedRoute = () => {
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    getMe()
      .then(() => setStatus("ok"))
      .catch(() => setStatus("denied"));
  }, []);

  if (status === "checking") return <p className="center-msg">Checking login...</p>;
  if (status === "denied") return <Navigate to="/login" replace />;

  return (
    <CartProvider>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </CartProvider>
  );
};

export default ProtectedRoute;
