import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getWishlist, logoutCustomer } from "../services/api";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { totalUnits } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Wishlist count comes from the backend; refreshed whenever a wishlist change happens
  useEffect(() => {
    const loadCount = () =>
      getWishlist()
        .then((res) => setWishlistCount(res.data.count))
        .catch(() => {});

    loadCount();
    window.addEventListener("wishlist-changed", loadCount);
    return () => window.removeEventListener("wishlist-changed", loadCount);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } finally {
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <Link to="/home" className="brand">ShopKart</Link>

      <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>☰</button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}>
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/wishlist">Wishlist ({wishlistCount})</NavLink>
        <NavLink to="/cart">Cart ({totalUnits})</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
