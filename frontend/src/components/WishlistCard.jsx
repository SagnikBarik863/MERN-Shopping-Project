import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, imageUrl } from "../services/api";
import StockStatus from "./StockStatus";

const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    const ok = await onRemove(product._id);
    if (!ok) setRemoving(false);
  };

  return (
    <div className="card">
      <img src={imageUrl(product.image)} alt={product.name} className="card-img" />
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="muted">{product.category}</p>
        <p className="price">{formatPrice(product.price)}</p>
        <StockStatus stock={product.stock} />

        <div className="card-actions">
          <Link to={`/products/${product._id}`} className="btn btn-outline">View Details</Link>
          <button className="btn btn-danger" onClick={handleRemove} disabled={removing}>
            {removing ? "Removing..." : "Remove ♥"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
