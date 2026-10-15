const StockStatus = ({ stock }) => {
  if (stock === 0) return <p className="stock out">Out of stock</p>;
  if (stock <= 5) return <p className="stock low">Only {stock} left</p>;
  return <p className="stock">{stock} units left</p>;
};

export default StockStatus;
