import { useEffect, useState } from "react";
import { getErrorMessage, notifyWishlistChanged, toggleWishlist } from "../services/api";

// Toggle button: "♡ Add to Wishlist" <-> "♥ Remove from Wishlist"
const WishlistButton = ({ productId, initiallySaved = false }) => {
  const [saved, setSaved] = useState(initiallySaved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setSaved(initiallySaved), [initiallySaved]);

  const handleClick = async () => {
    if (saving) return; // prevent duplicate requests
    setSaving(true);
    setError("");
    try {
      const res = await toggleWishlist(productId);
      setSaved(res.data.saved);
      notifyWishlistChanged();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save product. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  let label = saved ? "♥ Remove from Wishlist" : "♡ Add to Wishlist";
  if (saving) label = "⏳ Saving...";

  return (
    <>
      <button className={`btn ${saved ? "btn-wish-saved" : "btn-wish"}`} onClick={handleClick} disabled={saving}>
        {label}
      </button>
      {error && <p className="error-text">{error}</p>}
    </>
  );
};

export default WishlistButton;
