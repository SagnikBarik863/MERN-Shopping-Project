import { useEffect, useState } from "react";
import { getCategories, getProducts, getWishlist } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Categories + which products are already wishlisted (loaded once)
  useEffect(() => {
    getCategories().then((res) => setCategories(res.data.categories)).catch(() => {});
    getWishlist().then((res) => setSavedIds(res.data.wishlist.map((p) => p._id))).catch(() => {});
  }, []);

  // Fetch products from the backend whenever search / category / sort changes.
  // A small delay avoids sending a request on every single keystroke.
  useEffect(() => {
    setLoading(true);
    setError("");

    const timer = setTimeout(() => {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (sort) params.sort = sort;

      getProducts(params)
        .then((res) => setProducts(res.data.products))
        .catch(() => setError("Something went wrong while loading products."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <div>
      <h1>Products</h1>

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        sort={sort}
        onSortChange={setSort}
      />

      {loading && <p className="center-msg">Loading products...</p>}
      {!loading && error && <p className="center-msg error-text">{error}</p>}
      {!loading && !error && products.length === 0 && <p className="center-msg">No products found.</p>}

      {!loading && !error && products.length > 0 && (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} saved={savedIds.includes(product._id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
