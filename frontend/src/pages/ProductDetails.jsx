import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, getErrorMessage, getProduct, getWishlist, imageUrl } from "../services/api";
import StockStatus from "../components/StockStatus";
import WishlistButton from "../components/WishlistButton";
import AddToCartButton from "../components/AddToCartButton";

const ProductDetails = () => {
  const { id } = useParams(); // URL parameter
  const [product, setProduct] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getProduct(id)
      .then((res) => setProduct(res.data.product))
      .catch((err) => setError(getErrorMessage(err, "Something went wrong while loading the product.")))
      .finally(() => setLoading(false));

    getWishlist()
      .then((res) => setSaved(res.data.wishlist.some((p) => p._id === id)))
      .catch(() => {});
  }, [id]);

  if (loading) return <p className="center-msg">Loading product...</p>;

  if (error) {
    return (
      <div className="center-msg">
        <p className="error-text">{error}</p>
        <Link to="/products" className="btn">Back to Products</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/products" className="back-link">← Back to Products</Link>

      <div className="details">
        <img src={imageUrl(product.image)} alt={product.name} />

        <div>
          <h1>{product.name}</h1>
          <p className="muted">{product.category}</p>
          <p className="price big">{formatPrice(product.price)}</p>
          <StockStatus stock={product.stock} />
          <p>{product.description}</p>

          <div className="card-actions">
            <AddToCartButton product={product} />
            <WishlistButton productId={product._id} initiallySaved={saved} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
