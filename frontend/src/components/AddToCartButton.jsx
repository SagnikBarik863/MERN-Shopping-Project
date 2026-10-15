import { useState } from "react";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../services/api";

const AddToCartButton = ({ product }) => {
  const { cartItems, addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const inCart = cartItems.some((item) => item.product._id === product._id);
  const outOfStock = product.stock === 0;

  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    setMessage("");
    try {
      await addToCart(product._id);
      setIsError(false);
      setMessage("Added to cart");
    } catch (err) {
      setIsError(true);
      setMessage(getErrorMessage(err, "Could not add to cart"));
    } finally {
      setAdding(false);
    }
  };

  let label = inCart ? "Add Another" : "Add to Cart";
  if (adding) label = "Adding...";
  if (outOfStock) label = "Out of Stock";

  return (
    <>
      <button className="btn" onClick={handleAdd} disabled={adding || outOfStock}>
        {label}
      </button>
      {message && <p className={isError ? "error-text" : "success-text"}>{message}</p>}
    </>
  );
};

export default AddToCartButton;
