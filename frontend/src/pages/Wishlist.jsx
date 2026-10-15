import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage, getWishlist, notifyWishlistChanged, removeFromWishlist } from "../services/api";
import WishlistCard from "../components/WishlistCard";

// Wishlist data always comes from the backend (no global state used here - Lab 04)
const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadWishlist = () => {
    setLoading(true);
    setError("");
    getWishlist()
      .then((res) => setItems(res.data.wishlist))
      .catch(() => setError("We couldn't load your wishlist."))
      .finally(() => setLoading(false));
  };

  useEffect(loadWishlist, []);

  // Returns true on success so the card knows whether to stop its loading state
  const handleRemove = async (productId) => {
    setActionError("");
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((p) => p._id !== productId));
      notifyWishlistChanged();
      return true;
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not remove product."));
      return false;
    }
  };

  if (loading) return <p className="center-msg">Loading your wishlist...</p>;

  if (error) {
    return (
      <div className="center-msg">
        <h2>Something went wrong.</h2>
        <p>{error}</p>
        <button className="btn" onClick={loadWishlist}>Try Again</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="center-msg">
        <p className="big-icon">❤️</p>
        <h2>Your wishlist is empty</h2>
        <p className="muted">Save products you love and find them here later.</p>
        <Link to="/products" className="btn">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>My Wishlist</h1>
      <p className="muted">{items.length} {items.length === 1 ? "product" : "products"} saved</p>
      {actionError && <p className="alert alert-error">{actionError}</p>}

      <div className="grid">
        {items.map((product) => (
          <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
