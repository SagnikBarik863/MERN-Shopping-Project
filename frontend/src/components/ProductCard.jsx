import { Link } from "react-router-dom";
import { formatPrice, imageUrl } from "../services/api";
import StockStatus from "./StockStatus";
import WishlistButton from "./WishlistButton";
import AddToCartButton from "./AddToCartButton";

const ProductCard = ({ product, saved }) => {
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
          <WishlistButton productId={product._id} initiallySaved={saved} />
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
